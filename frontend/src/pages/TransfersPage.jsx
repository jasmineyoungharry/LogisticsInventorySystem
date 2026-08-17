import { useEffect, useState } from "react";
import api from "../api/api";
import { isManager } from "../utils/auth";
import "./TransfersPage.css";

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

  const manager = isManager();

  const loadData = async () => {
    try {
      setError("");

      const [
        productsResponse,
        warehousesResponse,
        transfersResponse
      ] = await Promise.all([
        api.get("/products"),
        api.get("/warehouses"),
        api.get("/inventorytransfers")
      ]);

      setProducts(productsResponse.data);
      setWarehouses(warehousesResponse.data);
      setTransfers(transfersResponse.data);

    } catch (error) {
      console.error("TRANSFER LOAD ERROR:", error);

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        console.error("URL:", error.config?.url);

        setError(
          `Failed to load transfer information. Server returned ${error.response.status}.`
        );
      } else {
        console.error("Message:", error.message);

        setError(
          error.message ||
          "Failed to load transfer information."
        );
      }

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

    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      fromWarehouseId: "",
      toWarehouseId: "",
      quantity: "",
      referenceNumber: "",
      notes: ""
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

    if (Number(formData.quantity) <= 0) {
      setError(
        "Transfer quantity must be greater than zero."
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

      resetForm();

      await loadData();

    } catch (error) {
      console.error(
        "TRANSFER SUBMISSION ERROR:",
        error
      );

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to transfer inventory."
        );

      } else if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Failed to complete transfer."
        );

      } else {
        setError(
          "Failed to complete transfer."
        );
      }
    }
  };

  const activeProducts = products.filter(
    (product) => product.isActive
  );

  const activeWarehouses = warehouses.filter(
    (warehouse) => warehouse.isActive
  );

  if (loading) {
    return (
      <div className="transfers-page">

        <div className="transfers-header">
          <div>
            <h1>Inventory Transfers</h1>

            <p>
              Move inventory between warehouse locations.
            </p>
          </div>
        </div>

        <div className="transfers-loading">
          Loading transfer information...
        </div>

      </div>
    );
  }

  return (
    <div className="transfers-page">

      {/* HEADER */}

      <div className="transfers-header">

        <div>
          <h1>Inventory Transfers</h1>

          <p>
            Move inventory from one warehouse to another.
          </p>
        </div>

      </div>

      {/* SUMMARY */}

      <div className="transfers-summary">

        <div className="transfers-stat-card">
          <span>Total Transfers</span>

          <strong>
            {transfers.length}
          </strong>

          <small>
            Recorded inventory transfers
          </small>
        </div>

        <div className="transfers-stat-card">
          <span>Active Products</span>

          <strong>
            {activeProducts.length}
          </strong>

          <small>
            Available for transfer
          </small>
        </div>

        <div className="transfers-stat-card">
          <span>Active Warehouses</span>

          <strong>
            {activeWarehouses.length}
          </strong>

          <small>
            Available locations
          </small>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="transfers-error">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="transfers-success">
          {success}
        </div>
      )}

      {/* CREATE TRANSFER */}

      {manager ? (

        <div className="transfers-form-card">

          <div className="transfers-form-header">

            <div>
              <h2>
                Create Transfer
              </h2>

              <p>
                Move inventory between active warehouse
                locations.
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="transfers-form-grid">

              {/* PRODUCT */}

              <div className="transfers-form-group">

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

                  {activeProducts.map((product) => (

                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name} ({product.sku})
                    </option>

                  ))}

                </select>

              </div>

              {/* QUANTITY */}

              <div className="transfers-form-group">

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
                  placeholder="Enter quantity"
                  required
                />

              </div>

              {/* FROM WAREHOUSE */}

              <div className="transfers-form-group">

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

                  {activeWarehouses.map(
                    (warehouse) => (

                      <option
                        key={warehouse.id}
                        value={warehouse.id}
                      >
                        {warehouse.name} (
                        {warehouse.code})
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* TO WAREHOUSE */}

              <div className="transfers-form-group">

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

                  {activeWarehouses.map(
                    (warehouse) => (

                      <option
                        key={warehouse.id}
                        value={warehouse.id}
                      >
                        {warehouse.name} (
                        {warehouse.code})
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* REFERENCE */}

              <div className="transfers-form-group">

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

              {/* NOTES */}

              <div className="transfers-form-group">

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

            <div className="transfers-form-actions">

              <button
                type="submit"
                className="transfers-primary-button"
              >
                Transfer Inventory
              </button>

              <button
                type="button"
                className="transfers-secondary-button"
                onClick={resetForm}
              >
                Clear
              </button>

            </div>

          </form>

        </div>

      ) : (

        <div className="transfers-readonly-notice">

          <strong>
            View Only
          </strong>

          <span>
            Inventory transfers can only be created by
            Managers.
          </span>

        </div>

      )}

      {/* TRANSFER HISTORY */}

      <div className="transfers-table-card">

        <div className="transfers-table-header">

          <div>

            <h2>
              Transfer History
            </h2>

            <p>
              Recent inventory movements between warehouses.
            </p>

          </div>

        </div>

        {transfers.length === 0 ? (

          <div className="transfers-empty">

            <h3>
              No transfers recorded
            </h3>

            <p>
              Completed inventory transfers will appear here.
            </p>

          </div>

        ) : (

          <div className="transfers-table-wrapper">

            <table className="transfers-table">

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                </tr>

              </thead>

              <tbody>

                {transfers.map((transfer) => (

                  <tr key={transfer.id}>

                    <td>

                      <span className="transfers-date">

                        {new Date(
                          transfer.createdAt ||
                          transfer.transferDate
                        ).toLocaleString()}

                      </span>

                    </td>

                    <td>

                      <span className="transfers-product">

                        {transfer.productName ||
                          transfer.product?.name ||
                          "-"}

                      </span>

                    </td>

                    <td>

                      <span className="transfers-warehouse">

                        {transfer.fromWarehouseName ||
                          transfer.sourceWarehouseName ||
                          "-"}

                      </span>

                    </td>

                    <td>

                      <span className="transfers-warehouse">

                        {transfer.toWarehouseName ||
                          transfer.destinationWarehouseName ||
                          "-"}

                      </span>

                    </td>

                    <td>

                      <span className="transfers-quantity">

                        {transfer.quantity}

                      </span>

                    </td>

                    <td>

                      <span className="transfers-reference">

                        {transfer.referenceNumber || "-"}

                      </span>

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

export default TransfersPage;