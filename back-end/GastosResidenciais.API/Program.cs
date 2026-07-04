using System.Text.Json.Serialization;
using GastosResidenciais.API.Data;
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

// Register AppDbContext backed by an in-memory database.
// "GastosResidenciaisDb" is the database name; it lives purely in RAM,
// so all data is wiped when the process exits — perfect for local dev/testing
// without needing a real SQL Server instance.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("GastosResidenciaisDb"));

// CORS policy that allows the React dev server (Vite default port) to call this API.
// All HTTP methods and headers are permitted to keep development friction low.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ---------------------------------------------------------------------------
// App pipeline
// ---------------------------------------------------------------------------

var app = builder.Build();

// Apply CORS before routing/controllers so the middleware intercepts every request.
app.UseCors("AllowFrontend");

app.UseAuthorization();
app.MapControllers();

// Override the default port so the API is always reachable at http://localhost:5000,
// regardless of what launchSettings.json says or how the process is started.
app.Urls.Add("http://localhost:5000");

app.Run();
