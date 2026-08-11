using LogisticsInventory.Api.Data;
using LogisticsInventory.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LogisticsInventory.Api.DTOs;

namespace LogisticsInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponseDto>>> GetProducts()
    {
        var products = await _context.Products
            .Select(product => new ProductResponseDto
            {
                Id = product.Id,
                SKU = product.SKU,
                Name = product.Name,
                Description = product.Description,
                UnitPrice = product.UnitPrice,
                ReorderLevel = product.ReorderLevel,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt
            })
            .ToListAsync();

        return Ok(products);
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponseDto>> GetProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        var response = new ProductResponseDto
        {
            Id = product.Id,
            SKU = product.SKU,
            Name = product.Name,
            Description = product.Description,
            UnitPrice = product.UnitPrice,
            ReorderLevel = product.ReorderLevel,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt
        };

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponseDto>> CreateProduct(ProductCreateDto dto)
    {
    var product = new Product
    {
        SKU = dto.SKU,
        Name = dto.Name,
        Description = dto.Description,
        UnitPrice = dto.UnitPrice,
        ReorderLevel = dto.ReorderLevel,
        IsActive = true,
        CreatedAt = DateTime.UtcNow
    };

    _context.Products.Add(product);
    await _context.SaveChangesAsync();

    var response = new ProductResponseDto
    {
            Id = product.Id,
            SKU = product.SKU,
            Name = product.Name,
            Description = product.Description,
            UnitPrice = product.UnitPrice,
            ReorderLevel = product.ReorderLevel,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt
        };

        return CreatedAtAction(
            nameof(GetProduct),
            new { id = product.Id },
            response
        );
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductResponseDto>> UpdateProduct(
        int id,
        ProductUpdateDto dto)
    {
        var existingProduct = await _context.Products.FindAsync(id);

        if (existingProduct == null)
        {
            return NotFound();
        }

        existingProduct.SKU = dto.SKU;
        existingProduct.Name = dto.Name;
        existingProduct.Description = dto.Description;
        existingProduct.UnitPrice = dto.UnitPrice;
        existingProduct.ReorderLevel = dto.ReorderLevel;
        existingProduct.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        var response = new ProductResponseDto
        {
            Id = existingProduct.Id,
            SKU = existingProduct.SKU,
            Name = existingProduct.Name,
            Description = existingProduct.Description,
            UnitPrice = existingProduct.UnitPrice,
            ReorderLevel = existingProduct.ReorderLevel,
            IsActive = existingProduct.IsActive,
            CreatedAt = existingProduct.CreatedAt
        };

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        product.IsActive = false;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}