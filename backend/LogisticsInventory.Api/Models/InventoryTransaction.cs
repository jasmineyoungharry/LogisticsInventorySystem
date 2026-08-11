namespace LogisticsInventory.Api.Models;

public class InventoryTransaction
{
    public int Id { get; set; }

    public int InventoryId { get; set; }

    public string TransactionType { get; set; } = string.Empty;

    public int QuantityChange { get; set; }

    public string? ReferenceNumber { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Inventory Inventory { get; set; } = null!;
}