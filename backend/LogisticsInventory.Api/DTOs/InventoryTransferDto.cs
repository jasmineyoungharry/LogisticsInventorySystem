using System.ComponentModel.DataAnnotations;

namespace LogisticsInventory.Api.DTOs;

public class InventoryTransferDto
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    public int FromWarehouseId { get; set; }

    [Required]
    public int ToWarehouseId { get; set; }

    [Range(1, 1000000)]
    public int Quantity { get; set; }

    [StringLength(50)]
    public string? ReferenceNumber { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}