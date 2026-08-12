using LogisticsInventory.Api.Data;
using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LogisticsInventory.Api.Services;

public class WarehouseService : IWarehouseService
{
    private readonly ApplicationDbContext _context;

    public WarehouseService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<WarehouseResponseDto>> GetAllAsync()
    {
        return await _context.Warehouses
            .Select(warehouse => new WarehouseResponseDto
            {
                Id = warehouse.Id,
                Code = warehouse.Code,
                Name = warehouse.Name,
                Address = warehouse.Address,
                City = warehouse.City,
                Province = warehouse.Province,
                PostalCode = warehouse.PostalCode,
                IsActive = warehouse.IsActive,
                CreatedAt = warehouse.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<WarehouseResponseDto?> GetByIdAsync(int id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);

        if (warehouse == null)
        {
            return null;
        }

        return new WarehouseResponseDto
        {
            Id = warehouse.Id,
            Code = warehouse.Code,
            Name = warehouse.Name,
            Address = warehouse.Address,
            City = warehouse.City,
            Province = warehouse.Province,
            PostalCode = warehouse.PostalCode,
            IsActive = warehouse.IsActive,
            CreatedAt = warehouse.CreatedAt
        };
    }

    public async Task<WarehouseResponseDto> CreateAsync(
        WarehouseCreateDto dto)
    {
        var warehouse = new Warehouse
        {
            Code = dto.Code,
            Name = dto.Name,
            Address = dto.Address,
            City = dto.City,
            Province = dto.Province,
            PostalCode = dto.PostalCode,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Warehouses.Add(warehouse);

        await _context.SaveChangesAsync();

        return new WarehouseResponseDto
        {
            Id = warehouse.Id,
            Code = warehouse.Code,
            Name = warehouse.Name,
            Address = warehouse.Address,
            City = warehouse.City,
            Province = warehouse.Province,
            PostalCode = warehouse.PostalCode,
            IsActive = warehouse.IsActive,
            CreatedAt = warehouse.CreatedAt
        };
    }

    public async Task<WarehouseResponseDto?> UpdateAsync(
        int id,
        WarehouseUpdateDto dto)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);

        if (warehouse == null)
        {
            return null;
        }

        warehouse.Code = dto.Code;
        warehouse.Name = dto.Name;
        warehouse.Address = dto.Address;
        warehouse.City = dto.City;
        warehouse.Province = dto.Province;
        warehouse.PostalCode = dto.PostalCode;

        // Editing a warehouse should NOT deactivate it.
        warehouse.IsActive = true;

        await _context.SaveChangesAsync();

        return new WarehouseResponseDto
        {
            Id = warehouse.Id,
            Code = warehouse.Code,
            Name = warehouse.Name,
            Address = warehouse.Address,
            City = warehouse.City,
            Province = warehouse.Province,
            PostalCode = warehouse.PostalCode,
            IsActive = warehouse.IsActive,
            CreatedAt = warehouse.CreatedAt
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);

        if (warehouse == null)
        {
            return false;
        }

        warehouse.IsActive = false;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ReactivateAsync(int id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);

        if (warehouse == null)
        {
            return false;
        }

        warehouse.IsActive = true;

        await _context.SaveChangesAsync();

        return true;
    }
}