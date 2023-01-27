using API.Extensions;
using API.Middleware;
using API.SignalR;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers(opt => 
{
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    opt.Filters.Add(new AuthorizeFilter(policy));
});
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

//Use site: https://securityheaders.com/ to test security
//From NWebsec.AspNetCore.Middleware Nuget package. Adds middleware to secure response headers
//Add response header: X-Content-Type-Options
app.UseXContentTypeOptions();
//Add response header: Referral-Policy. Do not allow referal when user navigate away from our web site
app.UseReferrerPolicy(opt => opt.NoReferrer());
//Add response header: X-Xss-Protection  add cross site protection header
app.UseXXssProtection(opt => opt.EnabledWithBlockMode());
//Add response header: X-Frame-Option.  Deny app being used in iFrame (prevents click jacking)
app.UseXfo(opt => opt.Deny());

//Use this line first to see warnings in the console and then switch to app.UseCsp with white list
// app.UseCspReportOnly(opt=>opt
//     .BlockAllMixedContent()
//     .StyleSources(s => s.Self())
//     .FontSources(s => s.Self())
//     .FormActions(s => s.Self())
//     .FrameAncestors(s => s.Self())
//     .ImageSources(s => s.Self())
//     .ScriptSources(s => s.Self())
// );

//Add response header: Content-Security-Policies. Used against XSS atacks. White list used sources to avoid warning in the console and possible XSS attack
app.UseCsp(opt => opt
    //blocks all https/http content 
    .BlockAllMixedContent()
    .StyleSources(s => s.Self().CustomSources("https://fonts.googleapis.com"))
    .FontSources(s => s.Self().CustomSources("https://fonts.gstatic.com", "data:"))
    .FormActions(s => s.Self())
    .FrameAncestors(s => s.Self())
    .ImageSources(s => s.Self().CustomSources("blob:", "https://res.cloudinary.com", "https://platform-lookaside.fbsbx.com"))
    .ScriptSources(s => s.Self())
);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else 
{
    //inline middleware 
    app.Use(async (context, next) => 
    {
        //use only https, the header will enforce it
        context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000");
        await next.Invoke();
    });
}

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

//look for wwwroot folder and search for index.html and serve from kestrel server
app.UseDefaultFiles();
//serve static files from wwwroot folder
app.UseStaticFiles();

app.MapControllers();
app.MapHub<ChatHub>("/chat");

//if it finds unrecognized root, pass it back to FallbackController which pass to client application 
app.MapFallbackToController("Index", "Fallback");

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<DataContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    await context.Database.MigrateAsync();
    await Seed.SeedData(context, userManager);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occured during migration");
}

app.Run();
