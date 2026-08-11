import ProductsPage from "./pages/ProductsPage";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import api from "./api/api";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          productsResponse,
          warehousesResponse,
          inventoriesResponse
        ] = await Promise.all([
          api.get("/products"),
          api.get("/warehouses"),
          api.get("/inventories")
        ]);

        setProducts(productsResponse.data);
        setWarehouses(warehousesResponse.data);
        setInventories(inventoriesResponse.data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <h1>Loading dashboard...</h1>;
  }

  const lowStockCount = inventories.filter(
    (inventory) => inventory.isLowStock
  ).length;

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Welcome to the Logistics Inventory System.</p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Products</h3>
          <p>{products.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Warehouses</h3>
          <p>{warehouses.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Inventory Records</h3>
          <p>{inventories.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Low Stock</h3>
          <p>{lowStockCount}</p>
        </div>
      </div>
    </div>
  );
}


function Warehouses() {
  return <h1>Warehouses</h1>;
}

function Inventory() {
  return <h1>Inventory</h1>;
}

function Transactions() {
  return <h1>Transactions</h1>;
}

function Transfers() {
  return <h1>Transfers</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Sidebar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transfers" element={<Transfers />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;