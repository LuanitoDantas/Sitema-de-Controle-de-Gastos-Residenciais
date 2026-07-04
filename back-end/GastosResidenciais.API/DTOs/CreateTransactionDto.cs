using System.ComponentModel.DataAnnotations;

namespace GastosResidenciais.API.DTOs;

/// <summary>
/// Payload used when creating a new transaction via POST /api/transactions.
/// </summary>
public class CreateTransactionDto
{
    [Required(ErrorMessage = "Description is required.")]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "Value must be greater than 0.")]
    public decimal Value { get; set; }

    /// <summary>Must be "expense" or "income".</summary>
    [Required(ErrorMessage = "Type is required.")]
    public string Type { get; set; } = string.Empty;

    [Required(ErrorMessage = "PersonId is required.")]
    public Guid PersonId { get; set; }
}
