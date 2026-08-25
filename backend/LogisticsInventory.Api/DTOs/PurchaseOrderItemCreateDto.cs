using System.ComponentModel.DataAnnotations;

namespace LogisticsInventory.Api.DTOs;

public class PurchaseOrderItemCreateDto
{
    [Required]
    public int ProductId { get; set; }

    [Range(1, 1000000)]
    public int Quantity { get; set; }

    [Range(typeof(decimal), "0.01", "100000000")]
    public decimal UnitCost { get; set; }
}