using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LogisticsInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;

    public WarehousesController(IWarehouseService warehouseService)
    {
        _warehouseService = warehouseService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WarehouseResponseDto>>> GetWarehouses()
    {
        var warehouses = await _warehouseService.GetAllAsync();

        return Ok(warehouses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WarehouseResponseDto>> GetWarehouse(int id)
    {
        var warehouse = await _warehouseService.GetByIdAsync(id);

        if (warehouse == null)
        {
            return NotFound();
        }

        return Ok(warehouse);
    }

    [Authorize(Roles = "Manager")]
    [HttpPost]
    public async Task<ActionResult<WarehouseResponseDto>> CreateWarehouse(
        WarehouseCreateDto dto)
    {
        var warehouse = await _warehouseService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetWarehouse),
            new { id = warehouse.Id },
            warehouse
        );
    }

    [Authorize(Roles = "Manager")]
    [HttpPut("{id}")]
    public async Task<ActionResult<WarehouseResponseDto>> UpdateWarehouse(
        int id,
        WarehouseUpdateDto dto)
    {
        var warehouse = await _warehouseService.UpdateAsync(id, dto);

        if (warehouse == null)
        {
            return NotFound();
        }

        return Ok(warehouse);
    }

    [Authorize(Roles = "Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWarehouse(int id)
    {
        var deleted = await _warehouseService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPut("{id}/reactivate")]
    public async Task<IActionResult> ReactivateWarehouse(int id)
    {
        var reactivated = await _warehouseService.ReactivateAsync(id);

        if (!reactivated)
        {
            return NotFound();
        }

        return Ok(new
        {
            message = "Warehouse reactivated successfully."
        });
    }
}