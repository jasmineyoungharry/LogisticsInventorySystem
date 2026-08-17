using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LogisticsInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoriesController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoriesController(
        IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryResponseDto>>>
        GetInventories()
    {
        var inventories =
            await _inventoryService.GetAllAsync();

        return Ok(inventories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryResponseDto>>
        GetInventory(int id)
    {
        var inventory =
            await _inventoryService.GetByIdAsync(id);

        if (inventory == null)
        {
            return NotFound();
        }

        return Ok(inventory);
    }

    [HttpGet("product/{productId}/warehouse/{warehouseId}")]
    public async Task<ActionResult<InventoryResponseDto>>
        GetInventoryByProductAndWarehouse(
            int productId,
            int warehouseId)
    {
        var inventory =
            await _inventoryService
                .GetByProductAndWarehouseAsync(
                    productId,
                    warehouseId);

        if (inventory == null)
        {
            return NotFound();
        }

        return Ok(inventory);
    }

    [HttpPost]
    public async Task<ActionResult<InventoryResponseDto>>
        CreateInventory(InventoryCreateDto dto)
    {
        var inventory =
            await _inventoryService.CreateAsync(dto);

        if (inventory == null)
        {
            return BadRequest(
                "The product or warehouse does not exist, or inventory already exists for this product and warehouse."
            );
        }

        return CreatedAtAction(
            nameof(GetInventory),
            new { id = inventory.Id },
            inventory
        );
    }

    [Authorize(Roles = "Manager")]
    [HttpPost("receive")]
    public async Task<ActionResult<InventoryResponseDto>>
        ReceiveInventory(InventoryReceiveDto dto)
    {
        var inventory =
            await _inventoryService.ReceiveAsync(dto);

        if (inventory == null)
        {
            return BadRequest(
                "The product or warehouse does not exist."
            );
        }

        return Ok(inventory);
    }

    [Authorize(Roles = "Manager")]
    [HttpPost("ship")]
    public async Task<ActionResult<InventoryResponseDto>>
        ShipInventory(InventoryShipDto dto)
    {
        var result =
            await _inventoryService.ShipAsync(dto);

        if (result.Inventory == null)
        {
            return BadRequest(
                result.Error
            );
        }

        return Ok(result.Inventory);
    }

    [Authorize(Roles = "Manager")]
    [HttpPut("{id}")]
    public async Task<ActionResult<InventoryResponseDto>>
        UpdateInventory(
            int id,
            InventoryUpdateDto dto)
    {
        var inventory =
            await _inventoryService.UpdateAsync(
                id,
                dto);

        if (inventory == null)
        {
            return NotFound();
        }

        return Ok(inventory);
    }

    [Authorize(Roles = "Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult>
        DeleteInventory(int id)
    {
        var deleted =
            await _inventoryService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}