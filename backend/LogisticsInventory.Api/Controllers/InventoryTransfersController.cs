using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LogisticsInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryTransfersController : ControllerBase
{
    private readonly IInventoryTransferService _transferService;

    public InventoryTransfersController(
        IInventoryTransferService transferService)
    {
        _transferService = transferService;
    }

    [HttpPost]
    public async Task<IActionResult> TransferInventory(
        InventoryTransferDto dto)
    {
        var success = await _transferService.TransferAsync(dto);

        if (!success)
        {
            return BadRequest(
                "The transfer could not be completed. Check the product, warehouses, available stock, and ensure the warehouses are different.");
        }

        return Ok(new
        {
            message = "Inventory transferred successfully."
        });
    }
}