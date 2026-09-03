using LogisticsInventory.Api.DTOs;

namespace LogisticsInventory.Api.Services;

public interface IPurchaseOrderService
{
    Task<IEnumerable<PurchaseOrderResponseDto>> GetAllAsync();

    Task<PurchaseOrderResponseDto?> GetByIdAsync(int id);

    Task<PurchaseOrderResponseDto?> CreateAsync(
        PurchaseOrderCreateDto dto);

    Task<PurchaseOrderResponseDto?> ReceiveAsync(int id);
}