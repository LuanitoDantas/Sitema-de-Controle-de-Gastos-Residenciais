using GastosResidenciais.API.Data;
using GastosResidenciais.API.DTOs;
using GastosResidenciais.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GastosResidenciais.API.Controllers;

/// <summary>
/// Manages financial transactions linked to people.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TransactionsController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>Returns all transactions across all people.</summary>
    /// <response code="200">List of transactions (may be empty).</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Transaction>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var transactions = await _db.Transactions.ToListAsync();
        return Ok(transactions);
    }

    /// <summary>Creates a new transaction for an existing person.</summary>
    /// <remarks>
    /// Business rules enforced here:
    /// 1. The referenced person must exist.
    /// 2. If the person is under 18 years old, only "expense" transactions are permitted.
    ///    Attempting to create an "income" transaction for a minor returns HTTP 400.
    /// </remarks>
    /// <param name="dto">Transaction details including the owning person's id.</param>
    /// <response code="201">The created transaction resource.</response>
    /// <response code="400">Validation error or minor-age income restriction violated.</response>
    /// <response code="404">The referenced person does not exist.</response>
    [HttpPost]
    [ProducesResponseType(typeof(Transaction), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create([FromBody] CreateTransactionDto dto)
    {
        // Validate that the transaction type is one of the accepted values.
        var normalizedType = dto.Type.ToLower();
        if (normalizedType != "expense" && normalizedType != "income")
            return BadRequest(new { message = "Type must be 'expense' or 'income'." });

        // Ensure the referenced person actually exists before creating the transaction.
        var person = await _db.People.FindAsync(dto.PersonId);
        if (person is null)
            return NotFound(new { message = $"Person with id '{dto.PersonId}' not found." });

        // Minor-age income restriction:
        // Persons under 18 years old are only allowed to record expenses.
        // If a caller attempts to create an "income" transaction for a minor, we reject it
        // immediately with HTTP 400 and a descriptive message.
        if (person.Age < 18 && normalizedType == "income")
        {
            return BadRequest(new
            {
                message = $"Person '{person.Name}' is under 18 years old and may only have 'expense' transactions. 'income' transactions are not allowed for minors."
            });
        }

        var transaction = new Transaction
        {
            Description = dto.Description,
            Value        = dto.Value,
            Type         = normalizedType,
            PersonId     = dto.PersonId
        };

        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { }, transaction);
    }
}
