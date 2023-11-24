FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build-env

# this is working directory of docker container
WORKDIR /app 
EXPOSE 8080

# copy .csproj and restore as distinct layers
COPY "Reactivities.sln" "Reactivities.sln"
COPY "API/API.csproj" "API/API.csproj"
COPY "Application/Application.csproj" "Application/Application.csproj"   
COPY "Persistence/Persistence.csproj" "Persistence/Persistence.csproj"
COPY "Domain/Domain.csproj" "Domain/Domain.csproj"
COPY "Infrastructure/Infrastructure.csproj" "Infrastructure/Infrastructure.csproj"

RUN dotnet restore "Reactivities.sln"

# copy everything else and build
COPY . .
WORKDIR /app
RUN dotnet publish -c Release -o out

# build a runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
# copy everything from build-env folder /app/out to folder /app. Period . means everything needs to be copied
COPY --from=build-env /app/out .
ENTRYPOINT [ "dotnet", "API.dll" ]

# NOTE: Command used with docker assuming reactivity-deploy is image we want to create
# To download image and run container of Postgres db: docker run --name my-postgres -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:latest
# To build docker image and run it in container: docker build -t yordy/reactivities-deploy .   NOTE: dot is needed on the end
# To run inside container from an image:  docker run --rm -it -p 8080:80 yordy/reactivities-deploy:latest
# To push to DockerHub: docker push yordy/reactivities-deploy:latest 
