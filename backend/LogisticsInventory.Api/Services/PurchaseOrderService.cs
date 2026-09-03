using LogisticsInventory.Api.Data;
using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LogisticsInventory.Api.Services;

public class PurchaseOrderService : IPurchaseOrderService
{
    private readonly ApplicationDbContext _context;

    public PurchaseOrderService(
        ApplicationDbContext context)
    {
        _context = context;
    }

    // GET ALL PURCHASE ORDERS

    public async Task<IEnumerable<PurchaseOrderResponseDto>>
        GetAllAsync()
    {
        var purchaseOrders = await _context.PurchaseOrders
            .Include(purchaseOrder => purchaseOrder.Supplier)
            .Include(purchaseOrder => purchaseOrder.Warehouse)
            .Include(purchaseOrder => purchaseOrder.Items)
                .ThenInclude(item => item.Product)
            .OrderByDescending(
                purchaseOrder => purchaseOrder.CreatedAt)
            .ToListAsync();

        return purchaseOrders.Select(MapToResponse);
    }


    // GET PURCHASE ORDER BY ID

    public async Task<PurchaseOrderResponseDto?>
        GetByIdAsync(int id)
    {
        var purchaseOrder = await _context.PurchaseOrders
            .Include(purchaseOrder => purchaseOrder.Supplier)
            .Include(purchaseOrder => purchaseOrder.Warehouse)
            .Include(purchaseOrder => purchaseOrder.Items)
                .ThenInclude(item => item.Product)
            .FirstOrDefaultAsync(
                purchaseOrder => purchaseOrder.Id == id);

        if (purchaseOrder == null)
        {
            return null;
        }

        return MapToResponse(purchaseOrder);
    }


    // CREATE PURCHASE ORDER

    public async Task<PurchaseOrderResponseDto?>
        CreateAsync(PurchaseOrderCreateDto dto)
    {
        // Validate supplier

        var supplierExists = await _context.Suppliers
            .AnyAsync(supplier =>
                supplier.Id == dto.SupplierId);

        if (!supplierExists)
        {
            return null;
        }


        // Validate warehouse

        var warehouseExists = await _context.Warehouses
            .AnyAsync(warehouse =>
                warehouse.Id == dto.WarehouseId);

        if (!warehouseExists)
        {
            return null;
        }


        // Validate purchase order number

        var purchaseOrderExists =
            await _context.PurchaseOrders
                .AnyAsync(purchaseOrder =>
                    purchaseOrder.PurchaseOrderNumber ==
                    dto.PurchaseOrderNumber.Trim());

        if (purchaseOrderExists)
        {
            return null;
        }


        // Make sure the order contains products

        if (dto.Items == null ||
            dto.Items.Count == 0)
        {
            return null;
        }


        // Make sure quantities and costs are valid

        foreach (var item in dto.Items)
        {
            if (item.Quantity <= 0)
            {
                return null;
            }

            if (item.UnitCost < 0)
            {
                return null;
            }
        }


        // Validate all products

        var productIds = dto.Items
            .Select(item => item.ProductId)
            .Distinct()
            .ToList();

        var existingProductIds =
            await _context.Products
                .Where(product =>
                    productIds.Contains(product.Id))
                .Select(product => product.Id)
                .ToListAsync();

        if (existingProductIds.Count != productIds.Count)
        {
            return null;
        }


        // Create purchase order

        var purchaseOrder = new PurchaseOrder
        {
            SupplierId = dto.SupplierId,

            WarehouseId = dto.WarehouseId,

            PurchaseOrderNumber =
                dto.PurchaseOrderNumber.Trim(),

            OrderDate = DateTime.UtcNow,

            ExpectedDate = dto.ExpectedDate,

            Status = "PENDING",

            Notes = dto.Notes,

            CreatedAt = DateTime.UtcNow
        };


        // Add purchase order items

        foreach (var itemDto in dto.Items)
        {
            var item = new PurchaseOrderItem
            {
                ProductId = itemDto.ProductId,

                Quantity = itemDto.Quantity,

                UnitCost = itemDto.UnitCost
            };

            purchaseOrder.Items.Add(item);
        }


        // Save purchase order

        _context.PurchaseOrders.Add(purchaseOrder);

        await _context.SaveChangesAsync();


        // Return created purchase order

        return await GetByIdAsync(purchaseOrder.Id);
    }


    // RECEIVE PURCHASE ORDER

    public async Task<PurchaseOrderResponseDto?>
        ReceiveAsync(int id)
    {
        var purchaseOrder = await _context.PurchaseOrders
            .Include(purchaseOrder => purchaseOrder.Items)
                .ThenInclude(item => item.Product)
            .FirstOrDefaultAsync(
                purchaseOrder => purchaseOrder.Id == id);


        // Purchase order does not exist

        if (purchaseOrder == null)
        {
            return null;
        }


        // Prevent receiving the same purchase order twice

        if (purchaseOrder.Status == "RECEIVED")
        {
            return null;
        }


        // Make sure the purchase order has items

        if (purchaseOrder.Items == null ||
            purchaseOrder.Items.Count == 0)
        {
            return null;
        }


        // Process each purchase order item

        foreach (var item in purchaseOrder.Items)
        {
            // Find inventory for this product
            // at the purchase order warehouse

            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(inventory =>
                    inventory.ProductId == item.ProductId &&
                    inventory.WarehouseId ==
                        purchaseOrder.WarehouseId);


            // If inventory does not exist,
            // create a new inventory record

            if (inventory == null)
            {
                inventory = new Inventory
                {
                    ProductId = item.ProductId,

                    WarehouseId =
                        purchaseOrder.WarehouseId,

                    Quantity = item.Quantity,

                    LastUpdated = DateTime.UtcNow
                };

                _context.Inventories.Add(inventory);

                // Save so the new inventory
                // receives its database ID

                await _context.SaveChangesAsync();
            }
            else
            {
                // Add received quantity
                // to existing inventory

                inventory.Quantity += item.Quantity;

                inventory.LastUpdated =
                    DateTime.UtcNow;
            }


            // Create inventory transaction

            var transaction = new InventoryTransaction
            {
                InventoryId = inventory.Id,

                TransactionType = "RECEIPT",

                QuantityChange = item.Quantity,

                ReferenceNumber =
                    purchaseOrder.PurchaseOrderNumber,

                Notes =
                    $"Received purchase order " +
                    $"{purchaseOrder.PurchaseOrderNumber}",

                CreatedAt = DateTime.UtcNow
            };

            _context.InventoryTransactions.Add(transaction);
        }


        // Mark purchase order as received

        purchaseOrder.Status = "RECEIVED";

        purchaseOrder.ReceivedAt =
            DateTime.UtcNow;


        // Save all changes

        await _context.SaveChangesAsync();


        // Return updated purchase order

        return await GetByIdAsync(id);
    }


    // MAP ENTITY TO RESPONSE DTO

    private static PurchaseOrderResponseDto MapToResponse(
        PurchaseOrder purchaseOrder)
    {
        var items = purchaseOrder.Items
            .Select(item => new PurchaseOrderItemResponseDto
            {
                Id = item.Id,

                ProductId = item.ProductId,

                ProductName =
                    item.Product?.Name ?? string.Empty,

                Quantity = item.Quantity,

                UnitCost = item.UnitCost,

                TotalCost =
                    item.Quantity * item.UnitCost
            })
            .ToList();


        return new PurchaseOrderResponseDto
        {
            Id = purchaseOrder.Id,

            SupplierId = purchaseOrder.SupplierId,

            SupplierName =
                purchaseOrder.Supplier?.Name ??
                string.Empty,

            WarehouseId = purchaseOrder.WarehouseId,

            WarehouseName =
                purchaseOrder.Warehouse?.Name ??
                string.Empty,

            PurchaseOrderNumber =
                purchaseOrder.PurchaseOrderNumber,

            OrderDate =
                purchaseOrder.OrderDate,

            ExpectedDate =
                purchaseOrder.ExpectedDate,

            Status =
                purchaseOrder.Status,

            Notes =
                purchaseOrder.Notes,

            CreatedAt =
                purchaseOrder.CreatedAt,

            ReceivedAt =
                purchaseOrder.ReceivedAt,

            TotalAmount =
                items.Sum(item => item.TotalCost),

            Items = items
        };
    }
}