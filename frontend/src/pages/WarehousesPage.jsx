import { useEffect, useState } from "react";
import api from "../api/api";
import { isManager } from "../utils/auth";
import "./WarehousesPage.css";

function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    city: "",
    province: "",
    postalCode: ""
  });

  const manager = isManager();

  const emptyForm = {
    code: "",
    name: "",
    address: "",
    city: "",
    province: "",
    postalCode: ""
  };

  const loadWarehouses = async () => {
    try {
      setError("");

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
    setFormData(emptyForm);
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

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to create warehouses."
        );
      } else {
        setError("Failed to create warehouse.");
      }
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

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to update warehouses."
        );
      } else {
        setError("Failed to update warehouse.");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingWarehouse(null);
    resetForm();
    setError("");
  };

  const handleCancelCreate = () => {
    setShowForm(false);
    resetForm();
    setError("");
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

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to deactivate warehouses."
        );
      } else {
        setError("Failed to deactivate warehouse.");
      }
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

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to reactivate warehouses."
        );
      } else {
        setError("Failed to reactivate warehouse.");
      }
    }
  };

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && warehouse.isActive) ||
      (statusFilter === "inactive" && !warehouse.isActive);

    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      search === "" ||
      warehouse.code.toLowerCase().includes(search) ||
      warehouse.name.toLowerCase().includes(search) ||
      warehouse.city.toLowerCase().includes(search) ||
      warehouse.province.toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });

  const activeWarehouses = warehouses.filter(
    (warehouse) => warehouse.isActive
  ).length;

  const inactiveWarehouses = warehouses.filter(
    (warehouse) => !warehouse.isActive
  ).length;

  if (loading) {
    return (
      <div className="warehouses-page">
        <div className="warehouses-header">
          <div>
            <h1>Warehouses</h1>
            <p>Manage your warehouse locations.</p>
          </div>
        </div>

        <div className="warehouses-loading">
          Loading warehouses...
        </div>
      </div>
    );
  }

  return (
    <div className="warehouses-page">

      {/* HEADER */}

      <div className="warehouses-header">

        <div>
          <h1>Warehouses</h1>
          <p>
            Manage warehouse locations and operational status.
          </p>
        </div>

        {manager && (
          <button
            className="warehouses-primary-button"
            onClick={() => {
              setShowForm(!showForm);
              setEditingWarehouse(null);
              resetForm();
              setError("");
            }}
          >
            {showForm ? "Cancel" : "+ Add Warehouse"}
          </button>
        )}

      </div>

      {/* SUMMARY */}

      <div className="warehouses-summary">

        <div className="warehouses-stat-card">
          <span>Total Warehouses</span>
          <strong>{warehouses.length}</strong>
          <small>Warehouse locations</small>
        </div>

        <div className="warehouses-stat-card">
          <span>Active Warehouses</span>
          <strong>{activeWarehouses}</strong>
          <small>Currently operational</small>
        </div>

        <div className="warehouses-stat-card">
          <span>Inactive Warehouses</span>
          <strong>{inactiveWarehouses}</strong>
          <small>Not currently operational</small>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="warehouses-error">
          {error}
        </div>
      )}

      {/* CREATE FORM */}

      {manager && showForm && (
        <div className="warehouses-form-card">

          <div className="warehouses-form-header">
            <h2>Add Warehouse</h2>
            <p>
              Create a new warehouse location.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="warehouses-form-grid">

              <div className="warehouses-form-group">
                <label htmlFor="code">Warehouse Code</label>

                <input
                  id="code"
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. WH-001"
                  required
                />
              </div>

              <div className="warehouses-form-group">
                <label htmlFor="name">Warehouse Name</label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter warehouse name"
                  required
                />
              </div>

              <div className="warehouses-form-group warehouses-full-width">
                <label htmlFor="address">Address</label>

                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                />
              </div>

              <div className="warehouses-form-group">
                <label htmlFor="city">City</label>

                <input
                  id="city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>

              <div className="warehouses-form-group">
                <label htmlFor="province">Province</label>

                <input
                  id="province"
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Province"
                  required
                />
              </div>

              <div className="warehouses-form-group">
                <label htmlFor="postalCode">Postal Code</label>

                <input
                  id="postalCode"
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal code"
                  required
                />
              </div>

            </div>

            <div className="warehouses-form-actions">

              <button
                type="submit"
                className="warehouses-primary-button"
              >
                Create Warehouse
              </button>

              <button
                type="button"
                className="warehouses-secondary-button"
                onClick={handleCancelCreate}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* EDIT FORM */}

      {manager && editingWarehouse && (
        <div className="warehouses-form-card">

          <div className="warehouses-form-header">
            <h2>Edit Warehouse</h2>
            <p>
              Update warehouse information.
            </p>
          </div>

          <form onSubmit={handleUpdate}>

            <div className="warehouses-form-grid">

              <div className="warehouses-form-group">
                <label htmlFor="editCode">
                  Warehouse Code
                </label>

                <input
                  id="editCode"
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="warehouses-form-group">
                <label htmlFor="editName">
                  Warehouse Name
                </label>

                <input
                  id="editName"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="warehouses-form-group warehouses-full-width">
                <label htmlFor="editAddress">
                  Address
                </label>

                <input
                  id="editAddress"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="warehouses-form-group">
                <label htmlFor="editCity">City</label>

                <input
                  id="editCity"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="warehouses-form-group">
                <label htmlFor="editProvince">
                  Province
                </label>

                <input
                  id="editProvince"
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="warehouses-form-group">
                <label htmlFor="editPostalCode">
                  Postal Code
                </label>

                <input
                  id="editPostalCode"
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="warehouses-form-actions">

              <button
                type="submit"
                className="warehouses-primary-button"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="warehouses-secondary-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* SEARCH / FILTER */}

      <div className="warehouses-filters">

        <div className="warehouses-search">
          <label htmlFor="warehouseSearch">
            Search Warehouses
          </label>

          <input
            id="warehouseSearch"
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search by code, name, city, or province..."
          />
        </div>

        <div className="warehouses-status-filter">
          <label htmlFor="warehouseStatus">
            Status
          </label>

          <select
            id="warehouseStatus"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All Warehouses</option>
          </select>
        </div>

      </div>

      {/* TABLE */}

      <div className="warehouses-table-card">

        <div className="warehouses-table-header">

          <div>
            <h2>Warehouse Locations</h2>

            <p>
              {filteredWarehouses.length} warehouse
              {filteredWarehouses.length !== 1 ? "s" : ""} found
            </p>
          </div>

        </div>

        {filteredWarehouses.length === 0 ? (

          <div className="warehouses-empty">
            <h3>No warehouses found</h3>

            <p>
              Try changing your search or status filter.
            </p>
          </div>

        ) : (

          <div className="warehouses-table-wrapper">

            <table className="warehouses-table">

              <thead>
                <tr>
                  <th>Code</th>
                  <th>Warehouse</th>
                  <th>Location</th>
                  <th>Status</th>

                  {manager && (
                    <th>Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>

                {filteredWarehouses.map((warehouse) => (

                  <tr key={warehouse.id}>

                    <td>
                      <span className="warehouses-code">
                        {warehouse.code}
                      </span>
                    </td>

                    <td>
                      <div className="warehouses-name">
                        {warehouse.name}
                      </div>
                    </td>

                    <td>

                      <div className="warehouses-location">
                        {warehouse.address && (
                          <div>{warehouse.address}</div>
                        )}

                        <span>
                          {warehouse.city},{" "}
                          {warehouse.province}{" "}
                          {warehouse.postalCode}
                        </span>
                      </div>

                    </td>

                    <td>

                      {warehouse.isActive ? (

                        <span className="warehouses-status warehouses-status-active">
                          Active
                        </span>

                      ) : (

                        <span className="warehouses-status warehouses-status-inactive">
                          Inactive
                        </span>

                      )}

                    </td>

                    {manager && (

                      <td>

                        <div className="warehouses-actions">

                          <button
                            className="warehouses-action-button"
                            onClick={() =>
                              handleEditClick(warehouse)
                            }
                          >
                            Edit
                          </button>

                          {warehouse.isActive ? (

                            <button
                              className="warehouses-action-button warehouses-danger-button"
                              onClick={() =>
                                handleDeactivate(warehouse)
                              }
                            >
                              Deactivate
                            </button>

                          ) : (

                            <button
                              className="warehouses-action-button"
                              onClick={() =>
                                handleReactivate(warehouse)
                              }
                            >
                              Reactivate
                            </button>

                          )}

                        </div>

                      </td>

                    )}

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default WarehousesPage;