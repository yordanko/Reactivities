using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    //Note: Kestrel server when can not find a url root will pass it to this controller.
    //It is a fallback controller for client app url. It will redirect to client app in wwwroot folder in our case
    [AllowAnonymous]
    public class FallbackController : Controller
    {
        public IActionResult Index() 
        {
            return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), 
                "wwwroot", "index.html"), "text/HTML");
        }
    }
}