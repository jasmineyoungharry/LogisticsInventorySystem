using System.ComponentModel.DataAnnotations;

namespace LogisticsInventory.Api.DTOs;

public class InventoryReceiveDto
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    public int WarehouseId { get; set; }

    [Range(1, 1000000)]
    public int Quantity { get; set; }

    [Range(0, 1000000)]
    public int ReorderLevel { get; set; }

    public string? ReferenceNumber { get; set; }

    public string? Notes { get; set; }
}