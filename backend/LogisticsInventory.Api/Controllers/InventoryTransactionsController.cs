using LogisticsInventory.Api.DTOs;
using LogisticsInventory.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LogisticsInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryTransactionsController : ControllerBase
{
    private readonly IInventoryTransactionService _transactionService;

    public InventoryTransactionsController(
        IInventoryTransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryTransactionResponseDto>>> GetTransactions()
    {
        var transactions = await _transactionService.GetAllAsync();

        return Ok(transactions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryTransactionResponseDto>> GetTransaction(int id)
    {
        var transaction = await _transactionService.GetByIdAsync(id);

        if (transaction == null)
        {
            return NotFound();
        }

        return Ok(transaction);
    }

    [HttpPost]
    public async Task<ActionResult<InventoryTransactionResponseDto>> CreateTransaction(
        InventoryTransactionCreateDto dto)
    {
        var transaction = await _transactionService.CreateAsync(dto);

        if (transaction == null)
        {
            return BadRequest(
                "The inventory record does not exist or the transaction would result in negative stock.");
        }

        return CreatedAtAction(
            nameof(GetTransaction),
            new { id = transaction.Id },
            transaction
        );
    }
}