using System.ComponentModel.DataAnnotations;

namespace LogisticsInventory.Api.DTOs;

public class InventoryTransactionCreateDto
{
    [Required]
    public int InventoryId { get; set; }

    [Required]
    [StringLength(20)]
    public string TransactionType { get; set; } = string.Empty;

    [Range(-1000000, 1000000)]
    public int QuantityChange { get; set; }

    [StringLength(50)]
    public string? ReferenceNumber { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}