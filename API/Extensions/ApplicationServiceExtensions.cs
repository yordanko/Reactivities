using Application.Activities;
using Application.Core;
using Application.Interfaces;
using FluentValidation;
using FluentValidation.AspNetCore;
using Infrastructure.Email;
using Infrastructure.Photos;
using Infrastructure.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services,
            IConfiguration config)
        {
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
            services.AddDbContext<DataContext>(options =>
            {
                var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

                 string connStr;

                // //NOTE: EXAMPLE OF POSTGRES DATABASE AND PRODUCTION DEPLOYMENT ON FLYIO. RENAME FOLDER: PERSISTAMCE / "PostGress Migrations" TO "Migrations" 
                // // Depending on if in development or production, use either FlyIO
                // // connection string, or development connection string from env var.
                if (env == "Development")
                {
                    // Use connection string from file.
                    connStr = config.GetConnectionString("PostGresConnection");
                }
                else
                {
                    // Use connection string provided at runtime by Flyio.
                    var connUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

                    // Parse connection URL to connection string for Npgsql
                    connUrl = connUrl.Replace("postgres://", string.Empty);
                    var pgUserPass = connUrl.Split("@")[0];
                    var pgHostPortDb = connUrl.Split("@")[1];
                    var pgHostPort = pgHostPortDb.Split("/")[0];
                    var pgDb = pgHostPortDb.Split("/")[1];
                    var pgUser = pgUserPass.Split(":")[0];
                    var pgPass = pgUserPass.Split(":")[1];
                    var pgHost = pgHostPort.Split(":")[0];
                    var pgPort = pgHostPort.Split(":")[1];

                    connStr = $"Server={pgHost};Port={pgPort};User Id={pgUser};Password={pgPass};Database={pgDb};";
                }

                // Whether the connection string came from the local development configuration file
                // or from the environment variable from FlyIO, use it to set up your DbContext.
                 options.UseNpgsql(connStr);

                // NOTE: Comment out below for Sql lite. 
                // When change database genarate migration: 1. Delete Migrations, 2. Delete Database, 3. Install proper nuget package for Object Ralated Mapper to EF 
                // and configure in this file (uncommented lines below). For example Sql lite NuGet package is: Microsoft.EntityFrameworkCore.Sqlite  4. Generate new migration (Command is: dotnet ef migrations add {NAME_OF_MIGRATION} -p Persistence -s API) 
                //connStr = config.GetConnectionString("SqlLite");
                //options.UseSqlite(connStr);
            });
            services.AddCors(opt =>
            {
                opt.AddPolicy("CorsPolicy", policy =>
                {
                    policy
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials() //resolves problem with connecting to SignalR hub, by allowing token to be send to Hub
                        //Add this to expose headers used in refresh token and pagination. Overrides HttpExtensions.cs response.Headers.Add("Access-Control-Expose-Headers", "Pagination");
                        .WithExposedHeaders("WWW-Authenticate", "Pagination")
                        .WithOrigins("http://localhost:3000", "https://localhost:3000");
                });
            });
            services.AddMediatR(typeof(List.Handler));
            services.AddAutoMapper(typeof(MappingProfiles).Assembly);
            services.AddFluentValidationAutoValidation();
            services.AddValidatorsFromAssemblyContaining<Create>();
            services.AddHttpContextAccessor();
            services.AddScoped<IUserAccessor, UserAccessor>();
            services.AddScoped<IPhotoAccessor, PhotoAccessor>();
            services.Configure<CloudinarySettings>(config.GetSection("Cloudinary"));
            services.AddSignalR();
            services.AddScoped<IEmailSender, EmailSender>();

            return services;
        }
    }
}