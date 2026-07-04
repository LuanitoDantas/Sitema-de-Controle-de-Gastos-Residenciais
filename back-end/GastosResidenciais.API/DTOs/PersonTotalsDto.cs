namespace GastosResidenciais.API.DTOs;

/// <summary>
/// Aggregated financial summary for a single person.
/// Returned as part of the totals endpoint response.
/// </summary>
public class PersonTotalsDto
{
    public Guid PersonId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }

    /// <summary>Balance = TotalIncome - TotalExpenses.</summary>
    public decimal Balance { get; set; }
}
