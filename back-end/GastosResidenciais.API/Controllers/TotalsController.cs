using GastosResidenciais.API.Data;
using GastosResidenciais.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GastosResidenciais.API.Controllers;

/// <summary>
/// Provides aggregated financial totals per person and globally.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TotalsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TotalsController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Returns income/expense totals for each person plus grand totals for the whole household.
    /// </summary>
    /// <remarks>
    /// Totals calculation strategy:
    /// 1. Load all people with their transactions using Include (single round-trip to the DB).
    /// 2. For each person, group their transactions by type ("income" / "expense") using LINQ
    ///    and sum the Value of each group.
    /// 3. Compute balance as TotalIncome - TotalExpenses.
    /// 4. Aggregate all per-person figures into a grand total.
    /// </remarks>
    /// <response code="200">Totals breakdown per person and globally.</response>
    [HttpGet]
    [ProducesResponseType(typeof(TotalsResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTotals()
    {
        // Single query: fetch all people and their transactions together.
        var people = await _db.People
            .Include(p => p.Transactions)
            .ToListAsync();

        // Project each person into a PersonTotalsDto.
        // LINQ sums values by filtering on the Type string for each group.
        var personTotals = people.Select(p =>
        {
            var totalIncome   = p.Transactions.Where(t => t.Type == "income").Sum(t => t.Value);
            var totalExpenses = p.Transactions.Where(t => t.Type == "expense").Sum(t => t.Value);

            return new PersonTotalsDto
            {
                PersonId      = p.Id,
                Name          = p.Name,
                TotalIncome   = totalIncome,
                TotalExpenses = totalExpenses,
                Balance       = totalIncome - totalExpenses
            };
        }).ToList();

        // Grand total: sum all individual person totals.
        var grandTotalIncome   = personTotals.Sum(pt => pt.TotalIncome);
        var grandTotalExpenses = personTotals.Sum(pt => pt.TotalExpenses);

        var response = new TotalsResponseDto
        {
            People = personTotals,
            GrandTotal = new GrandTotalDto
            {
                TotalIncome   = grandTotalIncome,
                TotalExpenses = grandTotalExpenses,
                Balance       = grandTotalIncome - grandTotalExpenses
            }
        };

        return Ok(response);
    }
}
