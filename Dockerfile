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
