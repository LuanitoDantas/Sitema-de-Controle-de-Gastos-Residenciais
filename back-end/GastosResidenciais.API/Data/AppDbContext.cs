using GastosResidenciais.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GastosResidenciais.API.Data;

/// <summary>
/// EF Core database context for the residential expense control system.
/// Uses an in-memory database — no SQL Server or file-based storage required.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Person> People => Set<Person>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure the one-to-many relationship between Person and Transaction.
        // OnDelete(DeleteBehavior.Cascade) ensures that when a Person row is deleted,
        // all associated Transaction rows are automatically removed by EF Core,
        // satisfying the business rule "delete person → delete their transactions".
        modelBuilder.Entity<Person>()
            .HasMany(p => p.Transactions)
            .WithOne(t => t.Person)
            .HasForeignKey(t => t.PersonId)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(modelBuilder);
    }
}
