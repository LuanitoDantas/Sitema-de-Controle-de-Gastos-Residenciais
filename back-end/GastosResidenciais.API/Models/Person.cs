using System.ComponentModel.DataAnnotations;

namespace GastosResidenciais.API.Models;

/// <summary>
/// Represents a person who can have associated financial transactions.
/// </summary>
public class Person
{
    /// <summary>Auto-generated unique identifier.</summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Full name of the person.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>Age in years; must be greater than zero.</summary>
    [Range(1, int.MaxValue, ErrorMessage = "Age must be greater than 0.")]
    public int Age { get; set; }

    /// <summary>
    /// Navigation property — EF Core uses this to load the person's transactions
    /// and to enforce cascade delete when the person is removed.
    /// </summary>
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
