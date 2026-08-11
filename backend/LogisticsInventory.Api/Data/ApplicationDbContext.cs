using LogisticsInventory.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LogisticsInventory.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }

    public DbSet<Warehouse> Warehouses { get; set; }

    public DbSet<Inventory> Inventories { get; set; }

    public DbSet<InventoryTransaction> InventoryTransactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Inventory>()
            .HasOne(inventory => inventory.Product)
            .WithMany()
            .HasForeignKey(inventory => inventory.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Inventory>()
            .HasOne(inventory => inventory.Warehouse)
            .WithMany()
            .HasForeignKey(inventory => inventory.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InventoryTransaction>()
            .HasOne(transaction => transaction.Inventory)
            .WithMany()
            .HasForeignKey(transaction => transaction.InventoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}