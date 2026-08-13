import { useEffect, useState } from "react";
import api from "../api/api";

function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          productsResponse,
          warehousesResponse,
          inventoryResponse,
          transactionsResponse
        ] = await Promise.all([
          api.get("/products"),
          api.get("/warehouses"),
          api.get("/inventories"),
          api.get("/inventorytransactions")
        ]);

        setProducts(productsResponse.data);
        setWarehouses(warehousesResponse.data);
        setInventory(inventoryResponse.data);
        setTransactions(transactionsResponse.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <h1>Loading dashboard...</h1>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  const lowStockItems = inventory.filter(
    (item) => item.isLowStock
  );

  const totalUnits = inventory.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Overview of your logistics and inventory system.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h3>Total Products</h3>
          <strong>{products.length}</strong>
          <p>Active products</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Warehouses</h3>
          <strong>{warehouses.length}</strong>
          <p>Active warehouses</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Units</h3>
          <strong>{totalUnits}</strong>
          <p>Units currently in inventory</p>
        </div>

        <div className="dashboard-card">
          <h3>Transactions</h3>
          <strong>{transactions.length}</strong>
          <p>Recorded inventory activities</p>
        </div>

      </div>

      <div className="dashboard-section">
        <h2>Low Stock Items</h2>

        {lowStockItems.length === 0 ? (
          <p>
            All inventory levels are currently healthy.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>Quantity</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.warehouseName}</td>
                    <td>{item.quantity}</td>
                    <td>{item.reorderLevel}</td>
                    <td>
                      <span className="status-low">
                        Low Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Recent Transactions</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Warehouse</th>
                <th>Type</th>
                <th>Quantity</th>
              </tr>
            </thead>

            <tbody>
              {transactions
                .slice(0, 5)
                .map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {new Date(
                        transaction.createdAt
                      ).toLocaleString()}
                    </td>

                    <td>
                      {transaction.productName}
                    </td>

                    <td>
                      {transaction.warehouseName}
                    </td>

                    <td>
                      {transaction.transactionType}
                    </td>

                    <td>
                      {transaction.quantityChange > 0
                        ? `+${transaction.quantityChange}`
                        : transaction.quantityChange}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;