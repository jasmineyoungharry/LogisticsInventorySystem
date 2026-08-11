using LogisticsInventory.Api.Data;
using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LogisticsInventory.Api.Services;

public class InventoryService : IInventoryService
{
    private readonly ApplicationDbContext _context;

    public InventoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InventoryResponseDto>> GetAllAsync()
    {
        return await _context.Inventories
            .Select(inventory => new InventoryResponseDto
            {
                Id = inventory.Id,
                ProductId = inventory.ProductId,
                ProductName = inventory.Product.Name,
                WarehouseId = inventory.WarehouseId,
                WarehouseName = inventory.Warehouse.Name,
                Quantity = inventory.Quantity,
                ReorderLevel = inventory.ReorderLevel,
                IsLowStock = inventory.Quantity <= inventory.ReorderLevel,
                LastUpdated = inventory.LastUpdated
            })
            .ToListAsync();
    }

    public async Task<InventoryResponseDto?> GetByIdAsync(int id)
    {
        return await _context.Inventories
            .Where(inventory => inventory.Id == id)
            .Select(inventory => new InventoryResponseDto
            {
                Id = inventory.Id,
                ProductId = inventory.ProductId,
                ProductName = inventory.Product.Name,
                WarehouseId = inventory.WarehouseId,
                WarehouseName = inventory.Warehouse.Name,
                Quantity = inventory.Quantity,
                ReorderLevel = inventory.ReorderLevel,
                IsLowStock = inventory.Quantity <= inventory.ReorderLevel,
                LastUpdated = inventory.LastUpdated
            })
            .FirstOrDefaultAsync();
    }

    public async Task<InventoryResponseDto?> GetByProductAndWarehouseAsync(
        int productId,
        int warehouseId)
    {
        return await _context.Inventories
            .Where(inventory =>
                inventory.ProductId == productId &&
                inventory.WarehouseId == warehouseId)
            .Select(inventory => new InventoryResponseDto
            {
                Id = inventory.Id,
                ProductId = inventory.ProductId,
                ProductName = inventory.Product.Name,
                WarehouseId = inventory.WarehouseId,
                WarehouseName = inventory.Warehouse.Name,
                Quantity = inventory.Quantity,
                ReorderLevel = inventory.ReorderLevel,
                IsLowStock = inventory.Quantity <= inventory.ReorderLevel,
                LastUpdated = inventory.LastUpdated
            })
            .FirstOrDefaultAsync();
    }

    public async Task<InventoryResponseDto?> CreateAsync(
        InventoryCreateDto dto)
    {
        var productExists = await _context.Products
            .AnyAsync(product => product.Id == dto.ProductId);

        if (!productExists)
        {
            return null;
        }

        var warehouseExists = await _context.Warehouses
            .AnyAsync(warehouse => warehouse.Id == dto.WarehouseId);

        if (!warehouseExists)
        {
            return null;
        }

        var existingInventory = await _context.Inventories
            .FirstOrDefaultAsync(inventory =>
                inventory.ProductId == dto.ProductId &&
                inventory.WarehouseId == dto.WarehouseId);

        if (existingInventory != null)
        {
            return null;
        }

        var inventory = new Inventory
        {
            ProductId = dto.ProductId,
            WarehouseId = dto.WarehouseId,
            Quantity = dto.Quantity,
            ReorderLevel = dto.ReorderLevel,
            LastUpdated = DateTime.UtcNow
        };

        _context.Inventories.Add(inventory);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(inventory.Id);
    }

    public async Task<InventoryResponseDto?> UpdateAsync(
        int id,
        InventoryUpdateDto dto)
    {
        var inventory = await _context.Inventories
            .FindAsync(id);

        if (inventory == null)
        {
            return null;
        }

        inventory.Quantity = dto.Quantity;
        inventory.ReorderLevel = dto.ReorderLevel;
        inventory.LastUpdated = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(inventory.Id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var inventory = await _context.Inventories
            .FindAsync(id);

        if (inventory == null)
        {
            return false;
        }

        _context.Inventories.Remove(inventory);

        await _context.SaveChangesAsync();

        return true;
    }
}