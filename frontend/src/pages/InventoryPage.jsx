import { useEffect, useState } from "react";
import api from "../api/api";

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [editingInventory, setEditingInventory] = useState(null);

  const [formData, setFormData] = useState({
    quantity: 0,
    reorderLevel: 0
  });

  const loadInventory = async () => {
    try {
      const response = await api.get("/inventories");
      setInventory(response.data);
    } catch (error) {
      console.error(error);
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleEditClick = (item) => {
    setEditingInventory(item);

    setFormData({
      quantity: item.quantity,
      reorderLevel: item.reorderLevel
    });

    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: Number(value)
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      await api.put(
        `/inventories/${editingInventory.id}`,
        formData
      );

      setEditingInventory(null);

      setFormData({
        quantity: 0,
        reorderLevel: 0
      });

      setError("");

      await loadInventory();
    } catch (error) {
      console.error(error);
      setError("Failed to update inventory.");
    }
  };

  const handleCancel = () => {
    setEditingInventory(null);

    setFormData({
      quantity: 0,
      reorderLevel: 0
    });
  };

  const filteredInventory = inventory.filter((item) => {
    if (statusFilter === "low") {
      return item.isLowStock;
    }

    if (statusFilter === "in-stock") {
      return !item.isLowStock;
    }

    return true;
  });

  if (loading) {
    return <h1>Loading inventory...</h1>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>
            Monitor product quantities across your warehouses.
          </p>
        </div>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      <div className="filter-container">
        <label htmlFor="inventoryFilter">
          Status:
        </label>

        <select
          id="inventoryFilter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="all">All</option>
          <option value="low">Low Stock</option>
          <option value="in-stock">In Stock</option>
        </select>
      </div>

      {editingInventory && (
        <div className="form-card">
          <h2>Adjust Inventory</h2>

          <p>
            {editingInventory.productName} —{" "}
            {editingInventory.warehouseName}
          </p>

          <form onSubmit={handleUpdate}>
            <div className="form-grid">

              <div className="form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reorder Level</label>

                <input
                  type="number"
                  name="reorderLevel"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <button
              type="submit"
              className="primary-button"
            >
              Save Changes
            </button>

            <button
              type="button"
              className="action-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.id}>
                <td>{item.productName}</td>

                <td>{item.warehouseName}</td>

                <td>{item.quantity}</td>

                <td>{item.reorderLevel}</td>

                <td>
                  {item.isLowStock ? (
                    <span className="status-low">
                      Low Stock
                    </span>
                  ) : (
                    <span className="status-active">
                      In Stock
                    </span>
                  )}
                </td>

                <td>
                  {new Date(
                    item.lastUpdated
                  ).toLocaleString()}
                </td>

                <td>
                  <button
                    className="action-button"
                    onClick={() =>
                      handleEditClick(item)
                    }
                  >
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryPage;