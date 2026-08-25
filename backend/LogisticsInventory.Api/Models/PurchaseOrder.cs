namespace LogisticsInventory.Api.Models;

public class PurchaseOrder
{
    public int Id { get; set; }

    public int SupplierId { get; set; }

    public int WarehouseId { get; set; }

    public string PurchaseOrderNumber { get; set; } = string.Empty;

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public DateTime? ExpectedDate { get; set; }

    public string Status { get; set; } = "PENDING";

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReceivedAt { get; set; }

    public Supplier Supplier { get; set; } = null!;

    public Warehouse Warehouse { get; set; } = null!;

    public ICollection<PurchaseOrderItem> Items { get; set; }
        = new List<PurchaseOrderItem>();
}