using System.ComponentModel.DataAnnotations;

namespace LogisticsInventory.Api.DTOs;

public class ProductCreateDto
{
    [Required]
    [StringLength(50)]
    public string SKU { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Name { get; set; } =string.Empty;

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, 1000000)]
    public decimal UnitPrice { get; set; }

    [Range(0, 100000)]
    public int ReorderLevel { get; set; }
}