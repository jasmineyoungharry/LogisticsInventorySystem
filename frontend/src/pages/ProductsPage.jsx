import { useEffect, useState } from "react";
import api from "../api/api";

function ProductsPage() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    unitPrice: "",
    reorderLevel: ""
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
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
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const openAddForm = () => {
    setEditingProduct(null);

    setFormData({
      sku: "",
      name: "",
      description: "",
      unitPrice: "",
      reorderLevel: ""
    });

    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);

    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      unitPrice: product.unitPrice,
      reorderLevel: product.reorderLevel
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);

    setFormData({
      sku: "",
      name: "",
      description: "",
      unitPrice: "",
      reorderLevel: ""
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const productData = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        unitPrice: Number(formData.unitPrice),
        reorderLevel: Number(formData.reorderLevel)
      };

      if (editingProduct) {
        await api.put(
          `/products/${editingProduct.id}`,
          productData
        );
      } else {
        await api.post("/products", productData);
      }

      closeForm();

      await loadProducts();

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        `Failed to ${
          editingProduct ? "update" : "create"
        } product.`
      );
    }
  };

  if (loading) {
    return <h1>Loading products...</h1>;
  }

  return (
    <div>

      <div className="page-header">

        <div>
          <h1>Products</h1>

          <p>
            Manage products stored in your logistics system.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={
            showForm
              ? closeForm
              : openAddForm
          }
        >
          {showForm ? "Cancel" : "Add Product"}
        </button>

      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-card">

          <h2>
            {editingProduct
              ? "Edit Product"
              : "Add Product"}
          </h2>

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

                <label>Product Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>Unit Price</label>

                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />

              </div>

              <div className="form-group">

                <label>Reorder Level</label>

                <input
                  type="number"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  min="0"
                  required
                />

              </div>

            </div>

            <div className="form-group">

              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />

            </div>

            <button
              type="submit"
              className="primary-button"
            >
              {editingProduct
                ? "Update Product"
                : "Create Product"}
            </button>

          </form>

        </div>
      )}

      <div className="dashboard-section">

        <h2>Product List</h2>

        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Unit Price</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {products.map((product) => (

                  <tr key={product.id}>

                    <td>
                      {product.id}
                    </td>

                    <td>
                      {product.sku}
                    </td>

                    <td>
                      {product.name}
                    </td>

                    <td>
                      {product.description || "-"}
                    </td>

                    <td>
                      ${Number(product.unitPrice).toFixed(2)}
                    </td>

                    <td>
                      {product.reorderLevel}
                    </td>

                    <td>

                      {product.isActive ? (
                        <span className="status-active">
                          Active
                        </span>
                      ) : (
                        <span className="status-inactive">
                          Inactive
                        </span>
                      )}

                    </td>

                    <td>

                      <button
                        className="secondary-button"
                        onClick={() =>
                          openEditForm(product)
                        }
                      >
                        Edit
                      </button>

                    </td>

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