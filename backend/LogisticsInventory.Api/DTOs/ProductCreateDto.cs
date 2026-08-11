namespace LogisticsInventory.Api.DTOs;

public class ProductCreateDto
{
    public string SKU { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }

    public int ReorderLevel { get; set; }
}