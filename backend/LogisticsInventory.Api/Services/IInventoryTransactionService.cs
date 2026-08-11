using LogisticsInventory.Api.DTOs;

namespace LogisticsInventory.Api.Services;

public interface IInventoryTransactionService
{
    Task<IEnumerable<InventoryTransactionResponseDto>> GetAllAsync();

    Task<InventoryTransactionResponseDto?> GetByIdAsync(int id);

    Task<InventoryTransactionResponseDto?> CreateAsync(
        InventoryTransactionCreateDto dto);
}