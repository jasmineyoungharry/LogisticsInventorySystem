using LogisticsInventory.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LogisticsInventory.Api.Data;

public class ApplicationDbContext : IdentityDbContext<IdentityUser>
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }

    public DbSet<Warehouse> Warehouses { get; set; }

    public DbSet<Inventory> Inventories { get; set; }

    public DbSet<InventoryTransaction> InventoryTransactions { get; set; }

    public DbSet<Supplier> Suppliers { get; set; }

    public DbSet<PurchaseOrder> PurchaseOrders { get; set; }

    public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Inventory → Product

        modelBuilder.Entity<Inventory>()
            .HasOne(inventory => inventory.Product)
            .WithMany()
            .HasForeignKey(inventory => inventory.ProductId)
            .OnDelete(DeleteBehavior.Restrict);


        // Inventory → Warehouse

        modelBuilder.Entity<Inventory>()
            .HasOne(inventory => inventory.Warehouse)
            .WithMany()
            .HasForeignKey(inventory => inventory.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);


        // Inventory Transaction → Inventory

        modelBuilder.Entity<InventoryTransaction>()
            .HasOne(transaction => transaction.Inventory)
            .WithMany()
            .HasForeignKey(transaction => transaction.InventoryId)
            .OnDelete(DeleteBehavior.Restrict);


        // Purchase Order → Supplier

        modelBuilder.Entity<PurchaseOrder>()
            .HasOne(purchaseOrder => purchaseOrder.Supplier)
            .WithMany()
            .HasForeignKey(purchaseOrder => purchaseOrder.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);


        // Purchase Order → Warehouse

        modelBuilder.Entity<PurchaseOrder>()
            .HasOne(purchaseOrder => purchaseOrder.Warehouse)
            .WithMany()
            .HasForeignKey(purchaseOrder => purchaseOrder.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);


        // Purchase Order → Purchase Order Items

        modelBuilder.Entity<PurchaseOrder>()
            .HasMany(purchaseOrder => purchaseOrder.Items)
            .WithOne(item => item.PurchaseOrder)
            .HasForeignKey(item => item.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);


        // Purchase Order Item → Product

        modelBuilder.Entity<PurchaseOrderItem>()
            .HasOne(item => item.Product)
            .WithMany()
            .HasForeignKey(item => item.ProductId)
            .OnDelete(DeleteBehavior.Restrict);


        // Purchase Order Number

        modelBuilder.Entity<PurchaseOrder>()
            .HasIndex(purchaseOrder => purchaseOrder.PurchaseOrderNumber)
            .IsUnique();


        // Decimal Precision

        modelBuilder.Entity<PurchaseOrderItem>()
            .Property(item => item.UnitCost)
            .HasPrecision(18, 2);
    }
}