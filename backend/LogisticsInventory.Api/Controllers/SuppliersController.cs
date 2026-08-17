using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LogisticsInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;

    public SuppliersController(
        ISupplierService supplierService)
    {
        _supplierService = supplierService;
    }

    [HttpGet]
    public async Task<
        ActionResult<IEnumerable<SupplierResponseDto>>
    > GetSuppliers()
    {
        var suppliers =
            await _supplierService.GetAllAsync();

        return Ok(suppliers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SupplierResponseDto>>
        GetSupplier(int id)
    {
        var supplier =
            await _supplierService.GetByIdAsync(id);

        if (supplier == null)
        {
            return NotFound();
        }

        return Ok(supplier);
    }

    [Authorize(Roles = "Manager")]
    [HttpPost]
    public async Task<ActionResult<SupplierResponseDto>>
        CreateSupplier(SupplierCreateDto dto)
    {
        var supplier =
            await _supplierService.CreateAsync(dto);

        if (supplier == null)
        {
            return BadRequest(
                "Unable to create supplier."
            );
        }

        return CreatedAtAction(
            nameof(GetSupplier),
            new { id = supplier.Id },
            supplier
        );
    }

    [Authorize(Roles = "Manager")]
    [HttpPut("{id}")]
    public async Task<ActionResult<SupplierResponseDto>>
        UpdateSupplier(
            int id,
            SupplierUpdateDto dto)
    {
        var supplier =
            await _supplierService.UpdateAsync(
                id,
                dto);

        if (supplier == null)
        {
            return NotFound();
        }

        return Ok(supplier);
    }

    [Authorize(Roles = "Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult>
        DeactivateSupplier(int id)
    {
        var success =
            await _supplierService.DeactivateAsync(id);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    [Authorize(Roles = "Manager")]
    [HttpPut("{id}/reactivate")]
    public async Task<IActionResult>
        ReactivateSupplier(int id)
    {
        var success =
            await _supplierService.ReactivateAsync(id);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }
}