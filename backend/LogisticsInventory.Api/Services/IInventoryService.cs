using LogisticsInventory.Api.DTOs;

namespace LogisticsInventory.Api.Services;

public interface IInventoryService
{
    Task<IEnumerable<InventoryResponseDto>> GetAllAsync();

    Task<InventoryResponseDto?> GetByIdAsync(int id);

    Task<InventoryResponseDto?> GetByProductAndWarehouseAsync(
        int productId,
        int warehouseId);

    Task<InventoryResponseDto?> CreateAsync(InventoryCreateDto dto);

    Task<InventoryResponseDto?> UpdateAsync(
        int id,
        InventoryUpdateDto dto);

    Task<bool> DeleteAsync(int id);
}