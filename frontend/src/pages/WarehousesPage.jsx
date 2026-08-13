import { useEffect, useState } from "react";
import api from "../api/api";

function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [statusFilter, setStatusFilter] = useState("active");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    city: "",
    province: "",
    postalCode: ""
  });

  const loadWarehouses = async () => {
    try {
      const response = await api.get("/warehouses");
      setWarehouses(response.data);
    } catch (error) {
      console.error(error);
      setError("Failed to load warehouses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      address: "",
      city: "",
      province: "",
      postalCode: ""
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post("/warehouses", formData);

      resetForm();
      setShowForm(false);
      setError("");

      await loadWarehouses();
    } catch (error) {
      console.error(error);
      setError("Failed to create warehouse.");
    }
  };

  const handleEditClick = (warehouse) => {
    setEditingWarehouse(warehouse);

    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address || "",
      city: warehouse.city,
      province: warehouse.province,
      postalCode: warehouse.postalCode
    });

    setShowForm(false);
    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      await api.put(
        `/warehouses/${editingWarehouse.id}`,
        formData
      );

      setEditingWarehouse(null);
      resetForm();
      setError("");

      await loadWarehouses();
    } catch (error) {
      console.error(error);
      setError("Failed to update warehouse.");
    }
  };

  const handleCancelEdit = () => {
    setEditingWarehouse(null);
    resetForm();
  };

  const handleDeactivate = async (warehouse) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${warehouse.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/warehouses/${warehouse.id}`);

      setError("");

      await loadWarehouses();
    } catch (error) {
      console.error(error);
      setError("Failed to deactivate warehouse.");
    }
  };

  const handleReactivate = async (warehouse) => {
    try {
      await api.put(
        `/warehouses/${warehouse.id}/reactivate`
      );

      setError("");

      await loadWarehouses();
    } catch (error) {
      console.error(error);
      setError("Failed to reactivate warehouse.");
    }
  };

  const filteredWarehouses = warehouses.filter((warehouse) => {
    if (statusFilter === "active") {
      return warehouse.isActive;
    }

    if (statusFilter === "inactive") {
      return !warehouse.isActive;
    }

    return true;
  });

  if (loading) {
    return <h1>Loading warehouses...</h1>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Warehouses</h1>
          <p>Manage your warehouse locations.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setEditingWarehouse(null);
            resetForm();
          }}
        >
          {showForm ? "Cancel" : "+ Add Warehouse"}
        </button>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      <div className="filter-container">
        <label htmlFor="statusFilter">
          Status:
        </label>

        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="all">All</option>
        </select>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Add Warehouse</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              <div className="form-group">
                <label>Code</label>

                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>City</label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Province</label>

                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Postal Code</label>

                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <button
              type="submit"
              className="primary-button"
            >
              Create Warehouse
            </button>
          </form>
        </div>
      )}

      {editingWarehouse && (
        <div className="form-card">
          <h2>Edit Warehouse</h2>

          <form onSubmit={handleUpdate}>
            <div className="form-grid">

              <div className="form-group">
                <label>Code</label>

                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>City</label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Province</label>

                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Postal Code</label>

                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
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
              onClick={handleCancelEdit}
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
              <th>Code</th>
              <th>Name</th>
              <th>Address</th>
              <th>City</th>
              <th>Province</th>
              <th>Postal Code</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredWarehouses.map((warehouse) => (
              <tr key={warehouse.id}>
                <td>{warehouse.code}</td>

                <td>{warehouse.name}</td>

                <td>{warehouse.address}</td>

                <td>{warehouse.city}</td>

                <td>{warehouse.province}</td>

                <td>{warehouse.postalCode}</td>

                <td>
                  {warehouse.isActive
                    ? "Active"
                    : "Inactive"}
                </td>

                <td>
                  <button
                    className="action-button"
                    onClick={() =>
                      handleEditClick(warehouse)
                    }
                  >
                    Edit
                  </button>

                  {warehouse.isActive ? (
                    <button
                      className="action-button danger-button"
                      onClick={() =>
                        handleDeactivate(warehouse)
                      }
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      className="action-button"
                      onClick={() =>
                        handleReactivate(warehouse)
                      }
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WarehousesPage;