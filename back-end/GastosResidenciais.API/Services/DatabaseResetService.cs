using GastosResidenciais.API.Data;
using Microsoft.EntityFrameworkCore;

namespace GastosResidenciais.API.Services;

/// <summary>
/// This is a public demo with no auth or per-visitor isolation, so unrelated
/// testers all share one database. Periodically wiping the data keeps one
/// visitor's test data from piling up indefinitely alongside everyone else's.
/// </summary>
public class DatabaseResetService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeSpan _interval;
    private readonly ILogger<DatabaseResetService> _logger;

    public DatabaseResetService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<DatabaseResetService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;

        var hours = configuration.GetValue<double?>("RESET_INTERVAL_HOURS") ?? 6;
        _interval = TimeSpan.FromHours(hours);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Database reset scheduled every {Interval}.", _interval);

        using var timer = new PeriodicTimer(_interval);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Deleting People also removes their Transactions: the FK is configured
            // with DeleteBehavior.Cascade (AppDbContext.OnModelCreating), which EF Core
            // materializes as an ON DELETE CASCADE constraint enforced by Postgres itself.
            var deleted = await db.People.ExecuteDeleteAsync(stoppingToken);

            _logger.LogInformation("Scheduled reset: cleared {Count} people (and their transactions).", deleted);
        }
    }
}
