using System.ComponentModel.DataAnnotations;

namespace LogisticsInventory.Api.DTOs;

public class PurchaseOrderCreateDto
{
    [Required]
    public int SupplierId { get; set; }

    [Required]
    public int WarehouseId { get; set; }

    [Required]
    [StringLength(50)]
    public string PurchaseOrderNumber { get; set; } = string.Empty;

    public DateTime? ExpectedDate { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    [Required]
    [MinLength(1)]
    public List<PurchaseOrderItemCreateDto> Items { get; set; }
        = new List<PurchaseOrderItemCreateDto>();
}