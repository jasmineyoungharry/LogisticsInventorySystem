import { useEffect, useState } from "react";
import api from "../api/api";
import { isManager } from "../utils/auth";
import "./SuppliersPage.css";

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: ""
  });

  const manager = isManager();

  const loadSuppliers = async () => {
    try {
      setError("");

      const response = await api.get("/suppliers");

      setSuppliers(response.data);
    } catch (error) {
      console.error(error);
      setError("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });

    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postalCode: ""
    });
  };

  const handleAddClick = () => {
    setEditingSupplier(null);
    resetForm();

    setShowForm(true);

    setError("");
    setSuccess("");
  };

  const handleEditClick = (supplier) => {
    setEditingSupplier(supplier);

    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address || "",
      city: supplier.city,
      province: supplier.province,
      postalCode: supplier.postalCode
    });

    setShowForm(true);

    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSupplier(null);
    resetForm();

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      if (editingSupplier) {
        await api.put(
          `/suppliers/${editingSupplier.id}`,
          formData
        );

        setSuccess(
          "Supplier updated successfully."
        );
      } else {
        await api.post(
          "/suppliers",
          formData
        );

        setSuccess(
          "Supplier created successfully."
        );
      }

      setShowForm(false);
      setEditingSupplier(null);
      resetForm();

      await loadSuppliers();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to manage suppliers."
        );
      } else if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Failed to save supplier."
        );
      } else {
        setError("Failed to save supplier.");
      }
    }
  };

  const handleDeactivate = async (supplier) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${supplier.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/suppliers/${supplier.id}`
      );

      setSuccess(
        "Supplier deactivated successfully."
      );

      await loadSuppliers();
    } catch (error) {
      console.error(error);

      setError(
        "Failed to deactivate supplier."
      );
    }
  };

  const handleReactivate = async (supplier) => {
    try {
      setError("");
      setSuccess("");

      await api.put(
        `/suppliers/${supplier.id}/reactivate`
      );

      setSuccess(
        "Supplier reactivated successfully."
      );

      await loadSuppliers();
    } catch (error) {
      console.error(error);

      setError(
        "Failed to reactivate supplier."
      );
    }
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          supplier.isActive) ||
        (statusFilter === "inactive" &&
          !supplier.isActive);

      const search =
        searchTerm.toLowerCase().trim();

      const matchesSearch =
        search === "" ||
        supplier.name
          .toLowerCase()
          .includes(search) ||
        supplier.contactPerson
          .toLowerCase()
          .includes(search) ||
        supplier.email
          .toLowerCase()
          .includes(search) ||
        supplier.city
          .toLowerCase()
          .includes(search);

      return matchesStatus && matchesSearch;
    }
  );

  const activeSuppliers =
    suppliers.filter(
      (supplier) => supplier.isActive
    ).length;

  const inactiveSuppliers =
    suppliers.filter(
      (supplier) => !supplier.isActive
    ).length;

  if (loading) {
    return (
      <div className="suppliers-page">

        <div className="suppliers-header">
          <div>
            <h1>Suppliers</h1>

            <p>
              Manage your supplier relationships.
            </p>
          </div>
        </div>

        <div className="suppliers-loading">
          Loading suppliers...
        </div>

      </div>
    );
  }

  return (
    <div className="suppliers-page">

      {/* HEADER */}

      <div className="suppliers-header">

        <div>
          <h1>Suppliers</h1>

          <p>
            Manage supplier information and
            purchasing relationships.
          </p>
        </div>

        {manager && (
          <button
            className="suppliers-primary-button"
            onClick={handleAddClick}
          >
            + Add Supplier
          </button>
        )}

      </div>

      {/* SUMMARY */}

      <div className="suppliers-summary">

        <div className="suppliers-stat-card">
          <span>Total Suppliers</span>

          <strong>
            {suppliers.length}
          </strong>

          <small>
            Registered suppliers
          </small>
        </div>

        <div className="suppliers-stat-card">
          <span>Active</span>

          <strong>
            {activeSuppliers}
          </strong>

          <small>
            Available for purchasing
          </small>
        </div>

        <div className="suppliers-stat-card">
          <span>Inactive</span>

          <strong>
            {inactiveSuppliers}
          </strong>

          <small>
            Deactivated suppliers
          </small>
        </div>

      </div>

      {/* MESSAGES */}

      {error && (
        <div className="suppliers-error">
          {error}
        </div>
      )}

      {success && (
        <div className="suppliers-success">
          {success}
        </div>
      )}

      {/* FORM */}

      {manager && showForm && (

        <div className="suppliers-form-card">

          <div className="suppliers-form-header">

            <div>
              <h2>
                {editingSupplier
                  ? "Edit Supplier"
                  : "Add Supplier"}
              </h2>

              <p>
                {editingSupplier
                  ? "Update supplier information."
                  : "Enter the supplier's business and contact information."}
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="suppliers-form-grid">

              <div className="suppliers-form-group">

                <label htmlFor="name">
                  Company Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="TechSource Canada"
                  required
                />

              </div>

              <div className="suppliers-form-group">

                <label htmlFor="contactPerson">
                  Contact Person
                </label>

                <input
                  id="contactPerson"
                  type="text"
                  name="contactPerson"
                  value={
                    formData.contactPerson
                  }
                  onChange={handleChange}
                  placeholder="John Smith"
                  required
                />

              </div>

              <div className="suppliers-form-group">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@supplier.com"
                  required
                />

              </div>

              <div className="suppliers-form-group">

                <label htmlFor="phone">
                  Phone
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="780-555-0100"
                  required
                />

              </div>

              <div className="suppliers-form-group suppliers-form-full-width">

                <label htmlFor="address">
                  Address
                </label>

                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Industrial Road"
                />

              </div>

              <div className="suppliers-form-group">

                <label htmlFor="city">
                  City
                </label>

                <input
                  id="city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Red Deer"
                  required
                />

              </div>

              <div className="suppliers-form-group">

                <label htmlFor="province">
                  Province
                </label>

                <input
                  id="province"
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Alberta"
                  required
                />

              </div>

              <div className="suppliers-form-group">

                <label htmlFor="postalCode">
                  Postal Code
                </label>

                <input
                  id="postalCode"
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="T4N 1A1"
                  required
                />

              </div>

            </div>

            <div className="suppliers-form-actions">

              <button
                type="submit"
                className="suppliers-primary-button"
              >
                {editingSupplier
                  ? "Save Changes"
                  : "Create Supplier"}
              </button>

              <button
                type="button"
                className="suppliers-secondary-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}

      {/* SEARCH / FILTER */}

      <div className="suppliers-filters">

        <div className="suppliers-search">

          <label htmlFor="supplierSearch">
            Search Suppliers
          </label>

          <input
            id="supplierSearch"
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search by company, contact, email, or city..."
          />

        </div>

        <div className="suppliers-status-filter">

          <label htmlFor="supplierStatus">
            Status
          </label>

          <select
            id="supplierStatus"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

            <option value="all">
              All
            </option>
          </select>

        </div>

      </div>

      {/* TABLE */}

      <div className="suppliers-table-card">

        <div className="suppliers-table-header">

          <div>
            <h2>
              Supplier Directory
            </h2>

            <p>
              {filteredSuppliers.length} supplier
              {filteredSuppliers.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

        </div>

        {filteredSuppliers.length === 0 ? (

          <div className="suppliers-empty">

            <h3>
              No suppliers found
            </h3>

            <p>
              Try changing your search or status
              filter.
            </p>

          </div>

        ) : (

          <div className="suppliers-table-wrapper">

            <table className="suppliers-table">

              <thead>

                <tr>
                  <th>Supplier</th>
                  <th>Contact</th>
                  <th>Contact Information</th>
                  <th>Location</th>
                  <th>Status</th>

                  {manager && (
                    <th>Actions</th>
                  )}
                </tr>

              </thead>

              <tbody>

                {filteredSuppliers.map(
                  (supplier) => (

                    <tr key={supplier.id}>

                      <td>
                        <div className="supplier-name">
                          {supplier.name}
                        </div>
                      </td>

                      <td>
                        {supplier.contactPerson}
                      </td>

                      <td>
                        <div>
                          {supplier.email}
                        </div>

                        <div className="supplier-phone">
                          {supplier.phone}
                        </div>
                      </td>

                      <td>
                        <div>
                          {supplier.city},{" "}
                          {supplier.province}
                        </div>

                        <div className="supplier-postal">
                          {supplier.postalCode}
                        </div>
                      </td>

                      <td>

                        {supplier.isActive ? (

                          <span className="supplier-status supplier-status-active">
                            Active
                          </span>

                        ) : (

                          <span className="supplier-status supplier-status-inactive">
                            Inactive
                          </span>

                        )}

                      </td>

                      {manager && (

                        <td>

                          <button
                            className="suppliers-action-button"
                            onClick={() =>
                              handleEditClick(
                                supplier
                              )
                            }
                          >
                            Edit
                          </button>

                          {supplier.isActive ? (

                            <button
                              className="suppliers-action-button suppliers-danger-button"
                              onClick={() =>
                                handleDeactivate(
                                  supplier
                                )
                              }
                            >
                              Deactivate
                            </button>

                          ) : (

                            <button
                              className="suppliers-action-button"
                              onClick={() =>
                                handleReactivate(
                                  supplier
                                )
                              }
                            >
                              Reactivate
                            </button>

                          )}

                        </td>

                      )}

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default SuppliersPage;