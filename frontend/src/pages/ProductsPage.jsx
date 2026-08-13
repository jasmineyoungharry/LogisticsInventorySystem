import { useEffect, useState } from "react";
import api from "../api/api";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    unitPrice: "",
    reorderLevel: ""
  });

  const loadProducts = async () => {
    try {
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

      setFormData({
        sku: "",
        name: "",
        description: "",
        unitPrice: "",
        reorderLevel: ""
      });

      setShowForm(false);
      setError("");

      await loadProducts();
    } catch (error) {
      console.error(error);
      setError("Failed to create product.");
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

      setFormData({
        sku: "",
        name: "",
        description: "",
        unitPrice: "",
        reorderLevel: ""
      });

      setError("");

      await loadProducts();
    }   catch (error) {
      console.error(error);
      setError("Failed to update product.");
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
      setError("Failed to deactivate product.");
    }
  };

  const handleReactivate = async (product) => {
    try {
      await api.put(`/products/${product.id}/reactivate`);

      setError("");

      await loadProducts();
    } catch (error) {
      console.error(error);
      setError("Failed to reactivate product.");
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);

    setFormData({
      sku: "",
      name: "",
      description: "",
      unitPrice: "",
      reorderLevel: ""
    });
  };

  if (loading) {
  return <h1>Loading products...</h1>;
}

  const filteredProducts = products.filter((product) => {
    if (statusFilter === "active") {
      return product.isActive;
    }

    if (statusFilter === "inactive") {
      return !product.isActive;
    }

    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage products in your inventory system.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setEditingProduct(null);
          }}
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {/* ADD PRODUCT FORM */}
      {showForm && (
        <div className="form-card">
          <h2>Add Product</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
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
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reorder Level</label>
                <input
                  type="number"
                  min="0"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <button type="submit" className="primary-button">
              Create Product
            </button>
          </form>
        </div>
      )}

      {/* EDIT PRODUCT FORM */}
      {editingProduct && (
        <div className="form-card">
          <h2>Edit Product</h2>

          <form onSubmit={handleUpdate}>
            <div className="form-grid">

              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Reorder Level</label>
                <input
                  type="number"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleChange}
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

      {/* STATUS FILTER */}
      <div className="filter-container">
        <label htmlFor="statusFilter">Status:</label>

      <select
        id="statusFilter"
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

      {/* PRODUCTS TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Reorder Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>${Number(product.unitPrice).toFixed(2)}</td>
                <td>{product.reorderLevel}</td>
                <td>
                  {product.isActive ? "Active" : "Inactive"}
                </td>

                <td>
                  <button
                    className="action-button"
                    onClick={() => handleEditClick(product)}
                  >
                    Edit
                  </button>

                  {product.isActive ? (
                    <button
                      className="action-button danger-button"
                      onClick={() => handleDeactivate(product)}
                    >
                      Deactivate
                  </button>
                ) : (
                  <button
                    className="action-button"
                    onClick={() => handleReactivate(product)}
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

export default ProductsPage;