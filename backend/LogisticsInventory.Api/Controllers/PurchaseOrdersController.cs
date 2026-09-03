using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LogisticsInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PurchaseOrdersController : ControllerBase
{
    private readonly IPurchaseOrderService _purchaseOrderService;

    public PurchaseOrdersController(
        IPurchaseOrderService purchaseOrderService)
    {
        _purchaseOrderService = purchaseOrderService;
    }

    // GET: api/PurchaseOrders
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var purchaseOrders =
            await _purchaseOrderService.GetAllAsync();

        return Ok(purchaseOrders);
    }

    // GET: api/PurchaseOrders/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var purchaseOrder =
            await _purchaseOrderService.GetByIdAsync(id);

        if (purchaseOrder == null)
        {
            return NotFound(new
            {
                message = "Purchase order not found."
            });
        }

        return Ok(purchaseOrder);
    }

    // POST: api/PurchaseOrders
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] PurchaseOrderCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var purchaseOrder =
            await _purchaseOrderService.CreateAsync(dto);

        if (purchaseOrder == null)
        {
            return BadRequest(new
            {
                message =
                    "Unable to create purchase order. " +
                    "Check the supplier, warehouse, products, " +
                    "and purchase order number."
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = purchaseOrder.Id },
            purchaseOrder);
    }

    // POST: api/PurchaseOrders/5/receive
    [HttpPost("{id}/receive")]
    public async Task<IActionResult> Receive(int id)
    {
        var purchaseOrder =
            await _purchaseOrderService.ReceiveAsync(id);

        if (purchaseOrder == null)
        {
            return BadRequest(new
            {
                message =
                    "Unable to receive purchase order. " +
                    "Make sure the purchase order exists, " +
                    "has not already been received, " +
                    "contains items, and inventory records exist."
            });
        }

        return Ok(new
        {
            message = "Purchase order received successfully.",
            purchaseOrder
        });
    }
}