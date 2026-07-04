using GastosResidenciais.API.Data;
using GastosResidenciais.API.DTOs;
using GastosResidenciais.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GastosResidenciais.API.Controllers;

/// <summary>
/// Manages CRUD operations for people in the system.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PeopleController : ControllerBase
{
    private readonly AppDbContext _db;

    public PeopleController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>Returns all registered people.</summary>
    /// <response code="200">List of people (may be empty).</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Person>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var people = await _db.People.ToListAsync();
        return Ok(people);
    }

    /// <summary>Creates a new person.</summary>
    /// <param name="dto">Name and age of the new person.</param>
    /// <response code="201">The created person resource.</response>
    /// <response code="400">Validation failed (e.g. missing name, age ≤ 0).</response>
    [HttpPost]
    [ProducesResponseType(typeof(Person), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePersonDto dto)
    {
        var person = new Person
        {
            Name = dto.Name,
            Age  = dto.Age
        };

        _db.People.Add(person);
        await _db.SaveChangesAsync();

        // Return 201 Created with a Location header pointing to the new resource.
        return CreatedAtAction(nameof(GetAll), new { }, person);
    }

    /// <summary>
    /// Deletes a person and all their transactions.
    /// EF Core's cascade delete (configured in AppDbContext) handles the transaction removal
    /// automatically when the Person entity is removed from the context.
    /// </summary>
    /// <param name="id">The unique identifier of the person to delete.</param>
    /// <response code="204">Person (and transactions) successfully deleted.</response>
    /// <response code="404">No person found with the given id.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var person = await _db.People.FindAsync(id);
        if (person is null)
            return NotFound(new { message = $"Person with id '{id}' not found." });

        // Removing the Person entity triggers cascade delete on the Transactions table
        // because of the DeleteBehavior.Cascade relationship configured in AppDbContext.
        _db.People.Remove(person);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
