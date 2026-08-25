namespace LogisticsInventory.Api.DTOs;

public class PurchaseOrderItemResponseDto
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitCost { get; set; }

    public decimal TotalCost { get; set; }
}