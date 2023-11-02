using System.Diagnostics;
using System.Security.Claims;
using System.Text;
using API.DTOs;
using API.Services;
using Application.Interfaces;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Persistence;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly DataContext _dataContext;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IEmailSender _emailSender;
        private readonly IOptions<IdentityOptions> _identityOptions;
        public AccountController(UserManager<AppUser> userManager, TokenService tokenService, 
                                IConfiguration config,  DataContext datacontext,        
                                SignInManager<AppUser> signInManager,
                                IEmailSender emailSender,
                                IOptions<IdentityOptions> identityOptions)
        {
            this._signInManager = signInManager;
            _emailSender = emailSender;
            _config = config;
            _tokenService = tokenService;
            _userManager = userManager;
            _dataContext = datacontext;
            _identityOptions = identityOptions;
            _httpClient = new HttpClient()            
            {
                BaseAddress = new System.Uri("https://graph.facebook.com")
            };

        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.Users.Include(p => p.Photos)
                .FirstOrDefaultAsync(x => x.Email == loginDto.Email);

            if (user == null) return Unauthorized("Invalid email");

            //if email confirmation is required
            if(_identityOptions.Value.SignIn.RequireConfirmedEmail)
            {
                //NOTE: The same version using SignIn manager instead, to be able to check if email is verified
                if(!user.EmailConfirmed) return  Unauthorized("Email not confirmed");
                
                var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
                if (result.Succeeded)
                {
                    await SetRefreshToken(user);
                    return CreateUserObject(user);
                }
                return Unauthorized("Invalid password");
            }
            else
            {
                //NOTE: comment out next couple of lines to use sign in manager, where email verification is checked
                var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);
                
                if (result)
                {
                    await SetRefreshToken(user);
                    return CreateUserObject(user);
                }
                return Unauthorized();
            }

            
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await _userManager.Users.AnyAsync(x => x.UserName == registerDto.Username))
            {
                //Note: Add error to Model State instead of returning Unauthorized as with login
                ModelState.AddModelError("username", "Username taken");

                //Note: Use ValidationProblem object to return array of errors
                return ValidationProblem();
            }

            if (await _userManager.Users.AnyAsync(x => x.Email == registerDto.Email))
            {
                ModelState.AddModelError("email", "Email taken");
                return ValidationProblem();
            }

            var user = new AppUser
            {
                DisplayName = registerDto.DisplayName,
                Email = registerDto.Email,
                UserName = registerDto.Username
            };


            var result = await _userManager.CreateAsync(user, registerDto.Password);

            //if email confirmation is required
            if(_identityOptions.Value.SignIn.RequireConfirmedEmail)
            {
                // Note: Validate email address
                if(!result.Succeeded) return BadRequest("Problem registering user");

                var origin = Request.Headers["origin"];
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

                //encode token. It is needed because will not match otherwise?!
                token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
                var verifyUrl = $"{origin}/account/verifyEmai?token={token}&email={user.Email}";
                var message = $"<p>Please click below link to verify your email address:</p><p><a href='{verifyUrl}'>Click to verify email</a></p>";
                await _emailSender.SendEmailAsync(user.Email, "Please verify email", message);

                return Ok("Regitration success - please verify email");
            }
            else
            {
                // Note:This code do not validate email address
                if (result.Succeeded)
                {
                    await SetRefreshToken(user);
                    return CreateUserObject(user);
                }
                 return BadRequest(result.Errors);
                
            }
        }


        [AllowAnonymous]
        [HttpPost("verifyEmail")]
        public async Task<IActionResult> VerifyEmail(string token, string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null ) return Unauthorized();

            var decodedTokenBytes = WebEncoders.Base64UrlDecode(token);
            var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes); 

            // Key method. Confirms token of the user is the same with the one in the database
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if(!result.Succeeded) return BadRequest();

            return Ok("Email confirmed - you can now login");
        } 

        [AllowAnonymous]
        [HttpGet("resendEmailConfirmationLink")]
        public async Task<IActionResult> ResendEmailConfirmationLink(string email) 
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Unauthorized();

            var origin = Request.Headers["origin"];
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            //encode token. It is needed because will not match otherwise?!
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var verifyUrl = $"{origin}/account/verifyEmai?token={token}&email={user.Email}";
            var message = $"<p>Please click below link to verify your email address:</p><p><a href='{verifyUrl}'>Click to verify email</a></p>";
            await _emailSender.SendEmailAsync(user.Email, "Please verify email", message);

            return Ok("Email verification link resent");

        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var user = await _userManager.Users.Include(p => p.Photos)
                .FirstOrDefaultAsync(x => x.Email == User.FindFirstValue(ClaimTypes.Email));
                
            await SetRefreshToken(user);
            return CreateUserObject(user);
        }

        //Note: Example loging with Facebook
        //Set up Facebook to sends token to my app: https://developers.facebook.com/apps/?show_reminder=true. 
        //Using Basic Settings, also add Facebook login add URIs and add select Login with the JavaScript SDK
        [AllowAnonymous]
        [HttpPost("fbLogin")]
        public async Task<ActionResult<UserDto>> FacebookLogin(string accessToken)
        {
            //verify token belong to this app from facebook endpoint: https://graph.facebook.com/debug_token
            var fbVerifyKeys = _config["Facebook:AppId"] + "|" + _config["Facebook:AppSecret"];
            var verifyTokenResponse = await _httpClient.GetAsync($"debug_token?input_token={accessToken}&access_token={fbVerifyKeys}");

            if(!verifyTokenResponse.IsSuccessStatusCode) return Unauthorized();

            //get facebook data from token from facebook endpoint: https://graph.facebook.com/me 
            var fbUrl = $"me?access_token={accessToken}&fields=name,email,picture.width(100).height(100)";
            var fbInfo = await _httpClient.GetFromJsonAsync<FacebookDto>(fbUrl);

            //try to find a user that already exist in our database
            var user = await _userManager.Users.Include(p=>p.Photos)
            .FirstOrDefaultAsync(x=>x.Email == fbInfo.Email);

            if(user != null) return CreateUserObject(user);

            //create a new user as it is the first time a user logs in
             var newUser = new AppUser{
                Email = fbInfo.Email,
                UserName = fbInfo.Email,
                Photos = new List<Photo>
                {
                    new Photo
                    {
                        //Note Id is needed
                        Id = "fbPhoto_" + fbInfo.Id,
                        Url = fbInfo.Picture.Data.Url,
                        IsMain = true

                    }

                }
            };

            var result = await _userManager.CreateAsync(newUser);

            if(!result.Succeeded) return BadRequest("Problem creating user account");

            await SetRefreshToken(user);
            return CreateUserObject(newUser);
        }


        // Note: Refresh jwt token end point. 
        // Validate refresh token in request cookies and if valid return a user with new jwt token.
        // 
        [Authorize]
        [HttpPost("refreshToken")]
        public async Task<ActionResult<UserDto>> RefreshJwtToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            Console.WriteLine($"Refresh token in cookie: {refreshToken}");

            //NOTE: There must be a refresh token in cookie is null on purpose. To get login working without refresh token comment out next line! 
            if (refreshToken == null) return Unauthorized(); 

            var user = await _userManager.Users
                .Include(t=>t.RefreshTokens)
                .Include(p=>p.Photos)
                .FirstOrDefaultAsync(x=>x.UserName == User.FindFirstValue(ClaimTypes.Name));

            if(user == null) return Unauthorized();

            var refreshTokenInDb = user.RefreshTokens.SingleOrDefault(x=>x.Token == refreshToken);
            if( refreshTokenInDb != null && !refreshTokenInDb.IsActive) return Unauthorized();

            //TODO: Add revoke option 
            // if (refreshTokenInDb != null) {
            //     refreshTokenInDb.Revoked = DateTime.UtcNow;
            //     await _dataContext.SaveChangesAsync();
            // }

            return CreateUserObject(user);
        }

        ////////////////////////////////////////////////////////////////////////////////
        //Refresh token are: 1. Longer lived than jwt, 2. Store in Db and in the client, 
        //3. Http only cookie(not accessible by JS) and pass with every call for new jwt token
        ////////////////////////////////////////////////////////////////////////////////
        
        
        //Generate refresh token, save it in db and add it to response cookies
        //it should be used on every call that gets jwt
        private async Task SetRefreshToken(AppUser user)
        {
            var refreshToken = _tokenService.CreateRefreshToken(user);
            user.RefreshTokens.Add(refreshToken);
            await _userManager.UpdateAsync(user);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true, //not accessible by javascript
                Expires = DateTime.UtcNow.AddDays(7),
                IsEssential = true,
                SameSite = SameSiteMode.None,
                Secure = true
            };

            Response.Cookies.Append("refreshToken", refreshToken.Token, cookieOptions);
        }

        private UserDto CreateUserObject(AppUser user)
        {
            return new UserDto
            {
                DisplayName = user.DisplayName,
                Image = user?.Photos?.FirstOrDefault(x => x.IsMain)?.Url,
                Token = _tokenService.CreateToken(user),
                Username = user.UserName
            };
        }
    }
}