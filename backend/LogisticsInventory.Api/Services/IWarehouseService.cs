using LogisticsInventory.Api.DTOs;

namespace LogisticsInventory.Api.Services;

public interface IWarehouseService
{
    Task<IEnumerable<WarehouseResponseDto>> GetAllAsync();

    Task<WarehouseResponseDto?> GetByIdAsync(int id);

    Task<WarehouseResponseDto> CreateAsync(
        WarehouseCreateDto dto);

    Task<WarehouseResponseDto?> UpdateAsync(
        int id,
        WarehouseUpdateDto dto);

    Task<bool> DeleteAsync(int id);

    Task<bool> ReactivateAsync(int id);
}