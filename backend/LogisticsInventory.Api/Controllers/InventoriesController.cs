using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LogisticsInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoriesController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoriesController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryResponseDto>>> GetInventories()
    {
        var inventories = await _inventoryService.GetAllAsync();

        return Ok(inventories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryResponseDto>> GetInventory(int id)
    {
        var inventory = await _inventoryService.GetByIdAsync(id);

        if (inventory == null)
        {
            return NotFound();
        }

        return Ok(inventory);
    }

    [HttpGet("product/{productId}/warehouse/{warehouseId}")]
    public async Task<ActionResult<InventoryResponseDto>> GetInventoryByProductAndWarehouse(
        int productId,
        int warehouseId)
    {
        var inventory = await _inventoryService
            .GetByProductAndWarehouseAsync(productId, warehouseId);

        if (inventory == null)
        {
            return NotFound();
        }

        return Ok(inventory);
    }

    [HttpPost]
    public async Task<ActionResult<InventoryResponseDto>> CreateInventory(
        InventoryCreateDto dto)
    {
        var inventory = await _inventoryService.CreateAsync(dto);

        if (inventory == null)
        {
            return BadRequest(
                "The product or warehouse does not exist, or inventory already exists for this product and warehouse.");
        }

        return CreatedAtAction(
            nameof(GetInventory),
            new { id = inventory.Id },
            inventory
        );
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InventoryResponseDto>> UpdateInventory(
        int id,
        InventoryUpdateDto dto)
    {
        var inventory = await _inventoryService.UpdateAsync(id, dto);

        if (inventory == null)
        {
            return NotFound();
        }

        return Ok(inventory);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInventory(int id)
    {
        var deleted = await _inventoryService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}