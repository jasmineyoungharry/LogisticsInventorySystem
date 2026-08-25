using LogisticsInventory.Api.Data;
using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LogisticsInventory.Api.Services;

public class InventoryTransferService : IInventoryTransferService
{
    private readonly ApplicationDbContext _context;

    public InventoryTransferService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> TransferAsync(InventoryTransferDto dto)
    {
        // Quantity must be greater than zero
        if (dto.Quantity <= 0)
        {
            return false;
        }

        // Source and destination warehouses must be different
        if (dto.FromWarehouseId == dto.ToWarehouseId)
        {
            return false;
        }

        // Find inventory in the source warehouse
        var fromInventory = await _context.Inventories
            .FirstOrDefaultAsync(inventory =>
                inventory.ProductId == dto.ProductId &&
                inventory.WarehouseId == dto.FromWarehouseId);

        if (fromInventory == null)
        {
            return false;
        }

        // Find inventory in the destination warehouse
        var toInventory = await _context.Inventories
            .FirstOrDefaultAsync(inventory =>
                inventory.ProductId == dto.ProductId &&
                inventory.WarehouseId == dto.ToWarehouseId);

        if (toInventory == null)
        {
            return false;
        }

        // Prevent negative inventory
        if (fromInventory.Quantity < dto.Quantity)
        {
            return false;
        }

        var now = DateTime.UtcNow;

        // Remove stock from source warehouse
        fromInventory.Quantity -= dto.Quantity;
        fromInventory.LastUpdated = now;

        // Add stock to destination warehouse
        toInventory.Quantity += dto.Quantity;
        toInventory.LastUpdated = now;

        // Create outgoing transaction
        var transferOut = new InventoryTransaction
        {
            InventoryId = fromInventory.Id,
            TransactionType = "TRANSFER_OUT",
            QuantityChange = -dto.Quantity,
            ReferenceNumber = dto.ReferenceNumber,
            Notes = dto.Notes,
            CreatedAt = now
        };

        // Create incoming transaction
        var transferIn = new InventoryTransaction
        {
            InventoryId = toInventory.Id,
            TransactionType = "TRANSFER_IN",
            QuantityChange = dto.Quantity,
            ReferenceNumber = dto.ReferenceNumber,
            Notes = dto.Notes,
            CreatedAt = now
        };

        _context.InventoryTransactions.Add(transferOut);
        _context.InventoryTransactions.Add(transferIn);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<object>> GetTransfersAsync()
    {
        var transfers = await _context.InventoryTransactions
            .Where(transaction =>
                transaction.TransactionType == "TRANSFER_OUT")
            .Include(transaction => transaction.Inventory)
                .ThenInclude(inventory => inventory.Product)
            .Include(transaction => transaction.Inventory)
                .ThenInclude(inventory => inventory.Warehouse)
            .OrderByDescending(transaction => transaction.CreatedAt)
            .Select(transaction => new
            {
                id = transaction.Id,

                createdAt = transaction.CreatedAt,

                productName =
                    transaction.Inventory.Product.Name,

                fromWarehouseName =
                    transaction.Inventory.Warehouse.Name,

                quantity =
                    Math.Abs(transaction.QuantityChange),

                referenceNumber =
                    transaction.ReferenceNumber,

                notes =
                    transaction.Notes
            })
            .Cast<object>()
            .ToListAsync();

        return transfers;
    }
}