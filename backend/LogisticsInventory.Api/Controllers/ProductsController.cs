using LogisticsInventory.Api.Data;
using LogisticsInventory.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        return await _context.Products.ToListAsync();
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        return product;
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        _context.Products.Add(product);

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id)
        {
            return BadRequest();
        }

        var existingProduct = await _context.Products.FindAsync(id);

        if (existingProduct == null)
        {
            return NotFound();
        }
        
        existingProduct.SKU = product.SKU;
        existingProduct.Name = product.Name;
        existingProduct.Description = product.Description;
        existingProduct.UnitPrice = product.UnitPrice;
        existingProduct.ReorderLevel = product.ReorderLevel;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}