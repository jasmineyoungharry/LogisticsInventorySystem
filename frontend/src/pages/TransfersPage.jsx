import { useEffect, useState } from "react";
import api from "../api/api";

function TransfersPage() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transfers, setTransfers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    productId: "",
    fromWarehouseId: "",
    toWarehouseId: "",
    quantity: "",
    referenceNumber: "",
    notes: ""
  });

  const loadData = async () => {
    try {
      const [productsResponse, warehousesResponse] =
        await Promise.all([
          api.get("/products"),
          api.get("/warehouses")
        ]);

      setProducts(productsResponse.data);
      setWarehouses(warehousesResponse.data);
    } catch (error) {
      console.error(error);
      setError("Failed to load products or warehouses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

    setError("");
    setSuccess("");

    if (
      formData.fromWarehouseId ===
      formData.toWarehouseId
    ) {
      setError(
        "The source and destination warehouses must be different."
      );
      return;
    }

    try {
      await api.post("/inventorytransfers", {
        productId: Number(formData.productId),
        fromWarehouseId: Number(formData.fromWarehouseId),
        toWarehouseId: Number(formData.toWarehouseId),
        quantity: Number(formData.quantity),
        referenceNumber: formData.referenceNumber,
        notes: formData.notes
      });

      setSuccess(
        "Inventory transfer completed successfully."
      );

      setFormData({
        productId: "",
        fromWarehouseId: "",
        toWarehouseId: "",
        quantity: "",
        referenceNumber: "",
        notes: ""
      });
    } catch (error) {
      console.error(error);

      if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Failed to complete transfer."
        );
      } else {
        setError("Failed to complete transfer.");
      }
    }
  };

  if (loading) {
    return <h1>Loading transfer information...</h1>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Inventory Transfers</h1>

          <p>
            Move inventory from one warehouse to another.
          </p>
        </div>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {success && (
        <p className="success-message">
          {success}
        </p>
      )}

      <div className="form-card">
        <h2>Create Transfer</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group">
              <label htmlFor="productId">
                Product
              </label>

              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select a product
                </option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fromWarehouseId">
                From Warehouse
              </label>

              <select
                id="fromWarehouseId"
                name="fromWarehouseId"
                value={formData.fromWarehouseId}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select source warehouse
                </option>

                {warehouses
                  .filter((warehouse) => warehouse.isActive)
                  .map((warehouse) => (
                    <option
                      key={warehouse.id}
                      value={warehouse.id}
                    >
                      {warehouse.name} ({warehouse.code})
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="toWarehouseId">
                To Warehouse
              </label>

              <select
                id="toWarehouseId"
                name="toWarehouseId"
                value={formData.toWarehouseId}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select destination warehouse
                </option>

                {warehouses
                  .filter((warehouse) => warehouse.isActive)
                  .map((warehouse) => (
                    <option
                      key={warehouse.id}
                      value={warehouse.id}
                    >
                      {warehouse.name} ({warehouse.code})
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">
                Quantity
              </label>

              <input
                id="quantity"
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="referenceNumber">
                Reference Number
              </label>

              <input
                id="referenceNumber"
                type="text"
                name="referenceNumber"
                placeholder="TRANSFER-002"
                value={formData.referenceNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">
                Notes
              </label>

              <input
                id="notes"
                type="text"
                name="notes"
                placeholder="Reason for transfer"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

          </div>

          <button
            type="submit"
            className="primary-button"
          >
            Transfer Inventory
          </button>
        </form>
      </div>
    </div>
  );
}

export default TransfersPage;