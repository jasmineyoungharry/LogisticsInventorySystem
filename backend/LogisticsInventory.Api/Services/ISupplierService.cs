using LogisticsInventory.Api.DTOs;

namespace LogisticsInventory.Api.Services;

public interface ISupplierService
{
    Task<IEnumerable<SupplierResponseDto>> GetAllAsync();

    Task<SupplierResponseDto?> GetByIdAsync(int id);

    Task<SupplierResponseDto?> CreateAsync(
        SupplierCreateDto dto);

    Task<SupplierResponseDto?> UpdateAsync(
        int id,
        SupplierUpdateDto dto);

    Task<bool> DeactivateAsync(int id);

    Task<bool> ReactivateAsync(int id);
}