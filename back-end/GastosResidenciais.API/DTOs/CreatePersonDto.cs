using System.ComponentModel.DataAnnotations;

namespace GastosResidenciais.API.DTOs;

/// <summary>
/// Payload used when creating a new person via POST /api/people.
/// </summary>
public class CreatePersonDto
{
    [Required(ErrorMessage = "Name is required.")]
    public string Name { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Age must be greater than 0.")]
    public int Age { get; set; }
}
