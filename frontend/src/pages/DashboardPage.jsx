import { useEffect, useState } from "react";
import api from "../api/api";

function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          productsResponse,
          warehousesResponse,
          suppliersResponse,
          inventoryResponse,
          transactionsResponse,
          purchaseOrdersResponse
        ] = await Promise.all([
          api.get("/products"),
          api.get("/warehouses"),
          api.get("/suppliers"),
          api.get("/inventories"),
          api.get("/inventorytransactions"),
          api.get("/purchaseorders")
        ]);

        setProducts(productsResponse.data);
        setWarehouses(warehousesResponse.data);
        setSuppliers(suppliersResponse.data);
        setInventory(inventoryResponse.data);
        setTransactions(transactionsResponse.data);
        setPurchaseOrders(purchaseOrdersResponse.data);
      } catch (error) {
        console.error("Dashboard error:", error);
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

  // LOW STOCK

  const lowStockItems = inventory.filter(
    (item) => item.isLowStock
  );

  // TOTAL INVENTORY UNITS

  const totalUnits = inventory.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // PURCHASE ORDER COUNTS

  const pendingPurchaseOrders = purchaseOrders.filter(
    (order) => order.status === "PENDING"
  );

  const receivedPurchaseOrders = purchaseOrders.filter(
    (order) => order.status === "RECEIVED"
  );

  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Overview of your logistics and inventory system.
          </p>
        </div>
      </div>


      {/* DASHBOARD CARDS */}

      <div className="dashboard-grid">

        {/* PRODUCTS */}

        <div className="dashboard-card">
          <h3>Total Products</h3>

          <strong>
            {products.length}
          </strong>

          <p>
            Active products
          </p>
        </div>


        {/* WAREHOUSES */}

        <div className="dashboard-card">
          <h3>Total Warehouses</h3>

          <strong>
            {warehouses.length}
          </strong>

          <p>
            Active warehouses
          </p>
        </div>


        {/* SUPPLIERS */}

        <div className="dashboard-card">
          <h3>Total Suppliers</h3>

          <strong>
            {suppliers.length}
          </strong>

          <p>
            Registered suppliers
          </p>
        </div>


        {/* INVENTORY */}

        <div className="dashboard-card">
          <h3>Total Units</h3>

          <strong>
            {totalUnits}
          </strong>

          <p>
            Units currently in inventory
          </p>
        </div>


        {/* TRANSACTIONS */}

        <div className="dashboard-card">
          <h3>Transactions</h3>

          <strong>
            {transactions.length}
          </strong>

          <p>
            Recorded inventory activities
          </p>
        </div>


        {/* PURCHASE ORDERS */}

        <div className="dashboard-card">
          <h3>Purchase Orders</h3>

          <strong>
            {purchaseOrders.length}
          </strong>

          <p>
            {pendingPurchaseOrders.length} pending
            {" • "}
            {receivedPurchaseOrders.length} received
          </p>
        </div>

      </div>


      {/* PURCHASE ORDER SUMMARY */}

      <div className="dashboard-section">

        <h2>
          Purchase Order Summary
        </h2>

        <div className="dashboard-grid">

          <div className="dashboard-card">
            <h3>Pending Orders</h3>

            <strong>
              {pendingPurchaseOrders.length}
            </strong>

            <p>
              Orders awaiting receipt
            </p>
          </div>


          <div className="dashboard-card">
            <h3>Received Orders</h3>

            <strong>
              {receivedPurchaseOrders.length}
            </strong>

            <p>
              Orders successfully received
            </p>
          </div>

        </div>

      </div>


      {/* LOW STOCK */}

      <div className="dashboard-section">

        <h2>
          Low Stock Items
        </h2>

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

                    <td>
                      {item.productName}
                    </td>

                    <td>
                      {item.warehouseName}
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                    <td>
                      {item.reorderLevel}
                    </td>

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


      {/* RECENT TRANSACTIONS */}

      <div className="dashboard-section">

        <h2>
          Recent Transactions
        </h2>

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


      {/* RECENT PURCHASE ORDERS */}

      <div className="dashboard-section">

        <h2>
          Recent Purchase Orders
        </h2>

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Warehouse</th>
                <th>Expected Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>

            </thead>


            <tbody>

              {purchaseOrders
                .slice(0, 5)
                .map((order) => (

                  <tr key={order.id}>

                    <td>
                      <strong>
                        {order.purchaseOrderNumber}
                      </strong>
                    </td>


                    <td>
                      {order.supplierName}
                    </td>


                    <td>
                      {order.warehouseName}
                    </td>


                    <td>
                      {order.expectedDate
                        ? new Date(
                            order.expectedDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>


                    <td>
                      ${Number(
                        order.totalAmount || 0
                      ).toFixed(2)}
                    </td>


                    <td>

                      <span
                        className={
                          order.status === "RECEIVED"
                            ? "status-received"
                            : "status-pending"
                        }
                      >
                        {order.status}
                      </span>

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