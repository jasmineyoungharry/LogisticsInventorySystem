using LogisticsInventory.Api.Data;
using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LogisticsInventory.Api.Services;

public class SupplierService : ISupplierService
{
    private readonly ApplicationDbContext _context;

    public SupplierService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SupplierResponseDto>>
        GetAllAsync()
    {
        return await _context.Suppliers
            .OrderBy(supplier => supplier.Name)
            .Select(supplier => new SupplierResponseDto
            {
                Id = supplier.Id,
                Name = supplier.Name,
                ContactPerson = supplier.ContactPerson,
                Email = supplier.Email,
                Phone = supplier.Phone,
                Address = supplier.Address,
                City = supplier.City,
                Province = supplier.Province,
                PostalCode = supplier.PostalCode,
                IsActive = supplier.IsActive,
                CreatedAt = supplier.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<SupplierResponseDto?> GetByIdAsync(
        int id)
    {
        return await _context.Suppliers
            .Where(supplier => supplier.Id == id)
            .Select(supplier => new SupplierResponseDto
            {
                Id = supplier.Id,
                Name = supplier.Name,
                ContactPerson = supplier.ContactPerson,
                Email = supplier.Email,
                Phone = supplier.Phone,
                Address = supplier.Address,
                City = supplier.City,
                Province = supplier.Province,
                PostalCode = supplier.PostalCode,
                IsActive = supplier.IsActive,
                CreatedAt = supplier.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<SupplierResponseDto?> CreateAsync(
        SupplierCreateDto dto)
    {
        var supplier = new Supplier
        {
            Name = dto.Name.Trim(),
            ContactPerson = dto.ContactPerson.Trim(),
            Email = dto.Email.Trim(),
            Phone = dto.Phone.Trim(),
            Address = dto.Address.Trim(),
            City = dto.City.Trim(),
            Province = dto.Province.Trim(),
            PostalCode = dto.PostalCode.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Suppliers.Add(supplier);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(supplier.Id);
    }

    public async Task<SupplierResponseDto?> UpdateAsync(
        int id,
        SupplierUpdateDto dto)
    {
        var supplier = await _context.Suppliers
            .FindAsync(id);

        if (supplier == null)
        {
            return null;
        }

        supplier.Name = dto.Name.Trim();
        supplier.ContactPerson =
            dto.ContactPerson.Trim();
        supplier.Email = dto.Email.Trim();
        supplier.Phone = dto.Phone.Trim();
        supplier.Address = dto.Address.Trim();
        supplier.City = dto.City.Trim();
        supplier.Province = dto.Province.Trim();
        supplier.PostalCode =
            dto.PostalCode.Trim();

        await _context.SaveChangesAsync();

        return await GetByIdAsync(supplier.Id);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var supplier = await _context.Suppliers
            .FindAsync(id);

        if (supplier == null)
        {
            return false;
        }

        supplier.IsActive = false;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ReactivateAsync(int id)
    {
        var supplier = await _context.Suppliers
            .FindAsync(id);

        if (supplier == null)
        {
            return false;
        }

        supplier.IsActive = true;

        await _context.SaveChangesAsync();

        return true;
    }
}