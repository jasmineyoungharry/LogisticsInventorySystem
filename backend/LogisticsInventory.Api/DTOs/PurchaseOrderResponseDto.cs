namespace LogisticsInventory.Api.DTOs;

public class PurchaseOrderResponseDto
{
    public int Id { get; set; }

    public int SupplierId { get; set; }

    public string SupplierName { get; set; } = string.Empty;

    public int WarehouseId { get; set; }

    public string WarehouseName { get; set; } = string.Empty;

    public string PurchaseOrderNumber { get; set; } = string.Empty;

    public DateTime OrderDate { get; set; }

    public DateTime? ExpectedDate { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ReceivedAt { get; set; }

    public decimal TotalAmount { get; set; }

    public List<PurchaseOrderItemResponseDto> Items { get; set; }
        = new List<PurchaseOrderItemResponseDto>();
}