using System.ComponentModel.DataAnnotations;

namespace GastosResidenciais.API.Models;

/// <summary>
/// Represents a financial transaction (income or expense) belonging to a person.
/// </summary>
public class Transaction
{
    /// <summary>Auto-generated unique identifier.</summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Human-readable description of the transaction.</summary>
    [Required]
    public string Description { get; set; } = string.Empty;

    /// <summary>Monetary value; must be greater than zero.</summary>
    [Range(0.01, double.MaxValue, ErrorMessage = "Value must be greater than 0.")]
    public decimal Value { get; set; }

    /// <summary>
    /// Transaction type: "expense" or "income".
    /// Persons under 18 may only have "expense" transactions.
    /// </summary>
    [Required]
    public string Type { get; set; } = string.Empty;

    /// <summary>Foreign key linking the transaction to its owner.</summary>
    public Guid PersonId { get; set; }

    /// <summary>Navigation property back to the owning person.</summary>
    public Person? Person { get; set; }
}
