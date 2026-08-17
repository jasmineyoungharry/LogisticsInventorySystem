using System.ComponentModel.DataAnnotations;

namespace LogisticsInventory.Api.DTOs;

public class InventoryShipDto
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    public int WarehouseId { get; set; }

    [Range(1, 1000000)]
    public int Quantity { get; set; }

    public string? ReferenceNumber { get; set; }

    public string? Notes { get; set; }
}