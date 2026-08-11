using System.ComponentModel.DataAnnotations;

namespace LogisticsInventory.Api.DTOs;

public class InventoryUpdateDto
{
    [Range(0, 1000000)]
    public int Quantity { get; set; }

    [Range(0, 1000000)]
    public int ReorderLevel { get; set; }
}