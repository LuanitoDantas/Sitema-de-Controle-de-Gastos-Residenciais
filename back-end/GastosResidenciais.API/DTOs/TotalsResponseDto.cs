namespace GastosResidenciais.API.DTOs;

/// <summary>
/// Top-level response returned by GET /api/totals.
/// Contains per-person summaries plus global grand totals.
/// </summary>
public class TotalsResponseDto
{
    public IEnumerable<PersonTotalsDto> People { get; set; } = Enumerable.Empty<PersonTotalsDto>();
    public GrandTotalDto GrandTotal { get; set; } = new();
}

/// <summary>
/// Aggregated totals across all people and all transactions.
/// </summary>
public class GrandTotalDto
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }

    /// <summary>Balance = TotalIncome - TotalExpenses.</summary>
    public decimal Balance { get; set; }
}
