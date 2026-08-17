import { useEffect, useState } from "react";
import api from "../api/api";
import { isManager } from "../utils/auth";
import "./ProductsPage.css";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    unitPrice: "",
    reorderLevel: ""
  });

  const manager = isManager();

  const emptyForm = {
    sku: "",
    name: "",
    description: "",
    unitPrice: "",
    reorderLevel: ""
  };

  const loadProducts = async () => {
    try {
      setError("");

      const response = await api.get("/products");

      setProducts(response.data);
    } catch (error) {
      console.error(error);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post("/products", {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        unitPrice: Number(formData.unitPrice),
        reorderLevel: Number(formData.reorderLevel)
      });

      setFormData(emptyForm);
      setShowForm(false);
      setError("");

      await loadProducts();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to create products."
        );
      } else {
        setError("Failed to create product.");
      }
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);

    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      unitPrice: product.unitPrice,
      reorderLevel: product.reorderLevel
    });

    setShowForm(false);
    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      await api.put(`/products/${editingProduct.id}`, {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        unitPrice: Number(formData.unitPrice),
        reorderLevel: Number(formData.reorderLevel),
        isActive: editingProduct.isActive
      });

      setEditingProduct(null);
      setFormData(emptyForm);
      setError("");

      await loadProducts();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to update products."
        );
      } else {
        setError("Failed to update product.");
      }
    }
  };

  const handleDeactivate = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${product.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/products/${product.id}`);

      setError("");

      await loadProducts();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to deactivate products."
        );
      } else {
        setError("Failed to deactivate product.");
      }
    }
  };

  const handleReactivate = async (product) => {
    try {
      await api.put(`/products/${product.id}/reactivate`);

      setError("");

      await loadProducts();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to reactivate products."
        );
      } else {
        setError("Failed to reactivate product.");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleCancelCreate = () => {
    setShowForm(false);
    setFormData(emptyForm);
    setError("");
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="products-header">
          <div>
            <h1>Products</h1>
            <p>Manage products in your inventory system.</p>
          </div>
        </div>

        <div className="products-loading">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((product) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.isActive) ||
      (statusFilter === "inactive" && !product.isActive);

    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      search === "" ||
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search) ||
      (product.description || "").toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });

  const activeProducts = products.filter(
    (product) => product.isActive
  ).length;

  const inactiveProducts = products.filter(
    (product) => !product.isActive
  ).length;

  return (
    <div className="products-page">

      {/* HEADER */}

      <div className="products-header">
        <div>
          <h1>Products</h1>
          <p>
            Manage products, pricing, and inventory settings.
          </p>
        </div>

        {manager && (
          <button
            className="products-primary-button"
            onClick={() => {
              setShowForm(!showForm);
              setEditingProduct(null);
              setError("");
            }}
          >
            {showForm ? "Cancel" : "+ Add Product"}
          </button>
        )}
      </div>

      {/* SUMMARY */}

      <div className="products-summary">

        <div className="products-stat-card">
          <span>Total Products</span>
          <strong>{products.length}</strong>
          <small>Products in catalogue</small>
        </div>

        <div className="products-stat-card">
          <span>Active Products</span>
          <strong>{activeProducts}</strong>
          <small>Currently available</small>
        </div>

        <div className="products-stat-card">
          <span>Inactive Products</span>
          <strong>{inactiveProducts}</strong>
          <small>Not currently available</small>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="products-error">
          {error}
        </div>
      )}

      {/* ADD FORM */}

      {manager && showForm && (
        <div className="products-form-card">

          <div className="products-form-header">
            <div>
              <h2>Add Product</h2>
              <p>
                Create a new product for your inventory.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="products-form-grid">

              <div className="products-form-group">
                <label htmlFor="sku">SKU</label>

                <input
                  id="sku"
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. PRD-001"
                  required
                />
              </div>

              <div className="products-form-group">
                <label htmlFor="name">
                  Product Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="products-form-group products-full-width">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter a short product description"
                  rows="3"
                />
              </div>

              <div className="products-form-group">
                <label htmlFor="unitPrice">
                  Unit Price
                </label>

                <input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="products-form-group">
                <label htmlFor="reorderLevel">
                  Reorder Level
                </label>

                <input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </div>

            </div>

            <div className="products-form-actions">

              <button
                type="submit"
                className="products-primary-button"
              >
                Create Product
              </button>

              <button
                type="button"
                className="products-secondary-button"
                onClick={handleCancelCreate}
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}

      {/* EDIT FORM */}

      {manager && editingProduct && (
        <div className="products-form-card">

          <div className="products-form-header">
            <div>
              <h2>Edit Product</h2>
              <p>
                Update product information and inventory settings.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdate}>

            <div className="products-form-grid">

              <div className="products-form-group">
                <label htmlFor="editSku">SKU</label>

                <input
                  id="editSku"
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="products-form-group">
                <label htmlFor="editName">
                  Product Name
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

              <div className="products-form-group products-full-width">
                <label htmlFor="editDescription">
                  Description
                </label>

                <textarea
                  id="editDescription"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="products-form-group">
                <label htmlFor="editPrice">
                  Unit Price
                </label>

                <input
                  id="editPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="products-form-group">
                <label htmlFor="editReorder">
                  Reorder Level
                </label>

                <input
                  id="editReorder"
                  type="number"
                  min="0"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="products-form-actions">

              <button
                type="submit"
                className="products-primary-button"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="products-secondary-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}

      {/* SEARCH / FILTER */}

      <div className="products-filters">

        <div className="products-search">
          <label htmlFor="productSearch">
            Search Products
          </label>

          <input
            id="productSearch"
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search by SKU, name, or description..."
          />
        </div>

        <div className="products-status-filter">
          <label htmlFor="statusFilter">
            Status
          </label>

          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">All Products</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

      </div>

      {/* TABLE */}

      <div className="products-table-card">

        <div className="products-table-header">

          <div>
            <h2>Product Catalogue</h2>
            <p>
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} found
            </p>
          </div>

        </div>

        {filteredProducts.length === 0 ? (

          <div className="products-empty">
            <h3>No products found</h3>
            <p>
              Try changing your search or filter.
            </p>
          </div>

        ) : (

          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Reorder Level</th>
                  <th>Status</th>

                  {manager && (
                    <th>Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>

                {filteredProducts.map((product) => (

                  <tr key={product.id}>

                    <td>
                      <span className="products-sku">
                        {product.sku}
                      </span>
                    </td>

                    <td>

                      <div className="products-name">
                        {product.name}
                      </div>

                      {product.description && (
                        <div className="products-description">
                          {product.description}
                        </div>
                      )}

                    </td>

                    <td>
                      <span className="products-price">
                        ${Number(product.unitPrice).toFixed(2)}
                      </span>
                    </td>

                    <td>
                      {product.reorderLevel}
                    </td>

                    <td>

                      {product.isActive ? (

                        <span className="products-status products-status-active">
                          Active
                        </span>

                      ) : (

                        <span className="products-status products-status-inactive">
                          Inactive
                        </span>

                      )}

                    </td>

                    {manager && (

                      <td>

                        <div className="products-actions">

                          <button
                            className="products-action-button"
                            onClick={() =>
                              handleEditClick(product)
                            }
                          >
                            Edit
                          </button>

                          {product.isActive ? (

                            <button
                              className="products-action-button products-danger-button"
                              onClick={() =>
                                handleDeactivate(product)
                              }
                            >
                              Deactivate
                            </button>

                          ) : (

                            <button
                              className="products-action-button"
                              onClick={() =>
                                handleReactivate(product)
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

export default ProductsPage;