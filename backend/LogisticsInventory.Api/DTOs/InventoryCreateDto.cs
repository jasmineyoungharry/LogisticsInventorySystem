using System.ComponentModel.DataAnnotations;

namespace LogisticsInventory.Api.DTOs;

public class InventoryCreateDto
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    public int WarehouseId { get; set; }

    [Range(0, 1000000)]
    public int Quantity { get; set; }

    [Range(0, 1000000)]
    public int ReorderLevel { get; set; }
}