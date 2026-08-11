using LogisticsInventory.Api.DTOs;

namespace LogisticsInventory.Api.Services;

public interface IInventoryTransferService
{
    Task<bool> TransferAsync(InventoryTransferDto dto);
}