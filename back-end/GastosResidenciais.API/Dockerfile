FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY GastosResidenciais.API.csproj ./
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .

# Railway injects PORT at runtime; Program.cs reads it to bind Kestrel.
ENTRYPOINT ["dotnet", "GastosResidenciais.API.dll"]
