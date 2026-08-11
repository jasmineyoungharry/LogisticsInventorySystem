namespace LogisticsInventory.Api.DTOs;

public class InventoryTransactionResponseDto
{
    public int Id { get; set; }

    public int InventoryId { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int WarehouseId { get; set; }

    public string WarehouseName { get; set; } = string.Empty;

    public string TransactionType { get; set; } = string.Empty;

    public int QuantityChange { get; set; }

    public string? ReferenceNumber { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }
}