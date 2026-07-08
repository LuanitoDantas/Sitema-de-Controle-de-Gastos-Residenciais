using System.Text.Json.Serialization;
using GastosResidenciais.API.Data;
using GastosResidenciais.API.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

// EF Core fixes up navigation properties both ways (Transaction.Person <-> Person.Transactions),
// which creates a reference cycle. IgnoreCycles tells System.Text.Json to stop
// re-serializing an object it has already written instead of throwing.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Resolve the Postgres connection string. Railway's Postgres plugin injects a
// DATABASE_URL env var in the "postgres://user:pass@host:port/db" URI format,
// which Npgsql doesn't accept directly, so it's converted below. Locally, fall
// back to ConnectionStrings:DefaultConnection from appsettings/user-secrets.
var connectionString = BuildConnectionString(builder.Configuration);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Public demo with no per-visitor isolation: periodically wipe People/Transactions
// so testers don't keep piling data on top of each other. Interval configurable
// via RESET_INTERVAL_HOURS; defaults to every 6 hours.
builder.Services.AddHostedService<DatabaseResetService>();

// CORS origins allowed to call this API. Comma-separated list via CORS_ORIGINS
// env var so the deployed frontend URL can be added without a code change;
// defaults to the Vite dev server for local development.
var corsOrigins = (builder.Configuration["CORS_ORIGINS"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ---------------------------------------------------------------------------
// App pipeline
// ---------------------------------------------------------------------------

var app = builder.Build();

// Apply any pending EF Core migrations on startup so a fresh Railway Postgres
// database is schema-ready without a manual migration step.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Apply CORS before routing/controllers so the middleware intercepts every request.
app.UseCors("AllowFrontend");

app.UseAuthorization();
app.MapControllers();

// Railway assigns the public port via the PORT env var and routes traffic to it;
// binding to a fixed port would fail health checks, so PORT takes priority and
// port 5000 remains only as the local-dev default.
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Urls.Add($"http://0.0.0.0:{port}");

app.Run();

static string BuildConnectionString(IConfiguration configuration)
{
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    if (string.IsNullOrEmpty(databaseUrl))
    {
        return configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "No database connection configured. Set DATABASE_URL or ConnectionStrings:DefaultConnection.");
    }

    // Railway provides DATABASE_URL as a URI: postgres://user:password@host:port/database
    var uri = new Uri(databaseUrl);
    var userInfo = uri.UserInfo.Split(':', 2);

    return new Npgsql.NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port,
        Username = userInfo[0],
        Password = userInfo.Length > 1 ? userInfo[1] : string.Empty,
        Database = uri.AbsolutePath.TrimStart('/'),
        // Prefer (not Require): Railway's internal Postgres network doesn't need TLS,
        // and Require would also validate the server certificate, which fails against
        // Railway's self-signed cert and crashes the app before it can bind the port.
        SslMode = Npgsql.SslMode.Prefer
    }.ConnectionString;
}
