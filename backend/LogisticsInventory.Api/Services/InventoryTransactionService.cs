using LogisticsInventory.Api.Data;
using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LogisticsInventory.Api.Services;

public class InventoryTransactionService : IInventoryTransactionService
{
    private readonly ApplicationDbContext _context;

    public InventoryTransactionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InventoryTransactionResponseDto>> GetAllAsync()
    {
        return await _context.InventoryTransactions
            .OrderByDescending(transaction => transaction.CreatedAt)
            .Select(transaction => new InventoryTransactionResponseDto
            {
                Id = transaction.Id,
                InventoryId = transaction.InventoryId,
                ProductId = transaction.Inventory.ProductId,
                ProductName = transaction.Inventory.Product.Name,
                WarehouseId = transaction.Inventory.WarehouseId,
                WarehouseName = transaction.Inventory.Warehouse.Name,
                TransactionType = transaction.TransactionType,
                QuantityChange = transaction.QuantityChange,
                ReferenceNumber = transaction.ReferenceNumber,
                Notes = transaction.Notes,
                CreatedAt = transaction.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<InventoryTransactionResponseDto?> GetByIdAsync(int id)
    {
        return await _context.InventoryTransactions
            .Where(transaction => transaction.Id == id)
            .Select(transaction => new InventoryTransactionResponseDto
            {
                Id = transaction.Id,
                InventoryId = transaction.InventoryId,
                ProductId = transaction.Inventory.ProductId,
                ProductName = transaction.Inventory.Product.Name,
                WarehouseId = transaction.Inventory.WarehouseId,
                WarehouseName = transaction.Inventory.Warehouse.Name,
                TransactionType = transaction.TransactionType,
                QuantityChange = transaction.QuantityChange,
                ReferenceNumber = transaction.ReferenceNumber,
                Notes = transaction.Notes,
                CreatedAt = transaction.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<InventoryTransactionResponseDto?> CreateAsync(
        InventoryTransactionCreateDto dto)
    {
        var inventory = await _context.Inventories
            .FirstOrDefaultAsync(inventory =>
                inventory.Id == dto.InventoryId);

        if (inventory == null)
        {
            return null;
        }

        var newQuantity = inventory.Quantity + dto.QuantityChange;

        if (newQuantity < 0)
        {
            return null;
        }

        var transaction = new InventoryTransaction
        {
            InventoryId = dto.InventoryId,
            TransactionType = dto.TransactionType.ToUpper(),
            QuantityChange = dto.QuantityChange,
            ReferenceNumber = dto.ReferenceNumber,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        inventory.Quantity = newQuantity;
        inventory.LastUpdated = DateTime.UtcNow;

        _context.InventoryTransactions.Add(transaction);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(transaction.Id);
    }
}