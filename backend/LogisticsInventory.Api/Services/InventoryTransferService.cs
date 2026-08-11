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
        if (dto.FromWarehouseId == dto.ToWarehouseId)
        {
            return false;
        }

        var fromInventory = await _context.Inventories
            .FirstOrDefaultAsync(inventory =>
                inventory.ProductId == dto.ProductId &&
                inventory.WarehouseId == dto.FromWarehouseId);

        if (fromInventory == null)
        {
            return false;
        }

        var toInventory = await _context.Inventories
            .FirstOrDefaultAsync(inventory =>
                inventory.ProductId == dto.ProductId &&
                inventory.WarehouseId == dto.ToWarehouseId);

        if (toInventory == null)
        {
            return false;
        }

        if (fromInventory.Quantity < dto.Quantity)
        {
            return false;
        }

        fromInventory.Quantity -= dto.Quantity;
        toInventory.Quantity += dto.Quantity;

        fromInventory.LastUpdated = DateTime.UtcNow;
        toInventory.LastUpdated = DateTime.UtcNow;

        var transferOut = new InventoryTransaction
        {
            InventoryId = fromInventory.Id,
            TransactionType = "TRANSFER_OUT",
            QuantityChange = -dto.Quantity,
            ReferenceNumber = dto.ReferenceNumber,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        var transferIn = new InventoryTransaction
        {
            InventoryId = toInventory.Id,
            TransactionType = "TRANSFER_IN",
            QuantityChange = dto.Quantity,
            ReferenceNumber = dto.ReferenceNumber,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _context.InventoryTransactions.Add(transferOut);
        _context.InventoryTransactions.Add(transferIn);

        await _context.SaveChangesAsync();

        return true;
    }
}