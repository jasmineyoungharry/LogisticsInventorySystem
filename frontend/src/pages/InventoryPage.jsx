import { useEffect, useState } from "react";
import api from "../api/api";
import { isManager } from "../utils/auth";
import "./InventoryPage.css";

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingInventory, setEditingInventory] = useState(null);
  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [showShipForm, setShowShipForm] = useState(false);

  const [formData, setFormData] = useState({
    quantity: 0,
    reorderLevel: 0
  });

  const [receiveFormData, setReceiveFormData] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
    reorderLevel: "10",
    referenceNumber: "",
    notes: ""
  });

  const [shipFormData, setShipFormData] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
    referenceNumber: "",
    notes: ""
  });

  const manager = isManager();

  const loadInventory = async () => {
    try {
      setError("");

      const response = await api.get("/inventories");

      setInventory(response.data);
    } catch (error) {
      console.error(error);
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryOptions = async () => {
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

      setError(
        "Failed to load products or warehouses."
      );
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleEditClick = (item) => {
    setEditingInventory(item);

    setShowReceiveForm(false);
    setShowShipForm(false);

    setSuccess("");
    setError("");

    setFormData({
      quantity: item.quantity,
      reorderLevel: item.reorderLevel
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: Number(value)
    });

    setError("");
    setSuccess("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

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

      setSuccess(
        "Inventory updated successfully."
      );

      await loadInventory();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to adjust inventory."
        );
      } else {
        setError("Failed to update inventory.");
      }
    }
  };

  const handleCancel = () => {
    setEditingInventory(null);

    setFormData({
      quantity: 0,
      reorderLevel: 0
    });

    setError("");
    setSuccess("");
  };

  /*
   * RECEIVE INVENTORY
   */

  const handleReceiveChange = (event) => {
    const { name, value } = event.target;

    setReceiveFormData({
      ...receiveFormData,
      [name]: value
    });

    setError("");
    setSuccess("");
  };

  const resetReceiveForm = () => {
    setReceiveFormData({
      productId: "",
      warehouseId: "",
      quantity: "",
      reorderLevel: "10",
      referenceNumber: "",
      notes: ""
    });
  };

  const openReceiveForm = async () => {
    setError("");
    setSuccess("");

    setEditingInventory(null);
    setShowShipForm(false);

    await loadInventoryOptions();

    setShowReceiveForm(true);
  };

  const closeReceiveForm = () => {
    setShowReceiveForm(false);

    resetReceiveForm();

    setError("");
    setSuccess("");
  };

  const handleReceive = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (Number(receiveFormData.quantity) <= 0) {
      setError(
        "Quantity received must be greater than zero."
      );

      return;
    }

    try {
      await api.post("/inventories/receive", {
        productId: Number(receiveFormData.productId),
        warehouseId: Number(receiveFormData.warehouseId),
        quantity: Number(receiveFormData.quantity),
        reorderLevel: Number(
          receiveFormData.reorderLevel
        ),
        referenceNumber:
          receiveFormData.referenceNumber,
        notes: receiveFormData.notes
      });

      setSuccess(
        "Inventory received successfully."
      );

      setShowReceiveForm(false);

      resetReceiveForm();

      await loadInventory();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to receive inventory."
        );
      } else if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Failed to receive inventory."
        );
      } else {
        setError(
          "Failed to receive inventory."
        );
      }
    }
  };

  /*
   * SHIP INVENTORY
   */

  const handleShipChange = (event) => {
    const { name, value } = event.target;

    setShipFormData({
      ...shipFormData,
      [name]: value
    });

    setError("");
    setSuccess("");
  };

  const resetShipForm = () => {
    setShipFormData({
      productId: "",
      warehouseId: "",
      quantity: "",
      referenceNumber: "",
      notes: ""
    });
  };

  const openShipForm = async () => {
    setError("");
    setSuccess("");

    setEditingInventory(null);
    setShowReceiveForm(false);

    await loadInventoryOptions();

    setShowShipForm(true);
  };

  const closeShipForm = () => {
    setShowShipForm(false);

    resetShipForm();

    setError("");
    setSuccess("");
  };

  const handleShip = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (Number(shipFormData.quantity) <= 0) {
      setError(
        "Quantity shipped must be greater than zero."
      );

      return;
    }

    try {
      await api.post("/inventories/ship", {
        productId: Number(shipFormData.productId),
        warehouseId: Number(shipFormData.warehouseId),
        quantity: Number(shipFormData.quantity),
        referenceNumber:
          shipFormData.referenceNumber,
        notes: shipFormData.notes
      });

      setSuccess(
        "Inventory shipped successfully."
      );

      setShowShipForm(false);

      resetShipForm();

      await loadInventory();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to ship inventory."
        );
      } else if (error.response?.data) {
        setError(
          typeof error.response.data === "string"
            ? error.response.data
            : "Failed to ship inventory."
        );
      } else {
        setError(
          "Failed to ship inventory."
        );
      }
    }
  };

  /*
   * FILTERING
   */

  const filteredInventory = inventory.filter((item) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "low" && item.isLowStock) ||
      (statusFilter === "in-stock" && !item.isLowStock);

    const search = searchTerm
      .toLowerCase()
      .trim();

    const matchesSearch =
      search === "" ||
      item.productName
        .toLowerCase()
        .includes(search) ||
      item.warehouseName
        .toLowerCase()
        .includes(search);

    return matchesStatus && matchesSearch;
  });

  /*
   * SUMMARY
   */

  const totalUnits = inventory.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const lowStockItems = inventory.filter(
    (item) => item.isLowStock
  ).length;

  const outOfStockItems = inventory.filter(
    (item) => item.quantity === 0
  ).length;

  /*
   * LOADING
   */

  if (loading) {
    return (
      <div className="inventory-page">

        <div className="inventory-header">
          <div>
            <h1>Inventory</h1>

            <p>
              Monitor product quantities across your
              warehouses.
            </p>
          </div>
        </div>

        <div className="inventory-loading">
          Loading inventory...
        </div>

      </div>
    );
  }

  return (
    <div className="inventory-page">

      {/* HEADER */}

      <div className="inventory-header">

        <div>
          <h1>Inventory</h1>

          <p>
            Monitor stock levels across your warehouse
            locations.
          </p>
        </div>

        {manager && (
          <div className="inventory-header-actions">

            <button
              className="inventory-secondary-button"
              onClick={openShipForm}
            >
              − Ship Inventory
            </button>

            <button
              className="inventory-primary-button"
              onClick={openReceiveForm}
            >
              + Receive Inventory
            </button>

          </div>
        )}

      </div>

      {/* SUMMARY CARDS */}

      <div className="inventory-summary">

        <div className="inventory-stat-card">
          <span>Total Units</span>

          <strong>
            {totalUnits}
          </strong>

          <small>
            Units currently in inventory
          </small>
        </div>

        <div className="inventory-stat-card">
          <span>Low Stock</span>

          <strong>
            {lowStockItems}
          </strong>

          <small>
            Items requiring attention
          </small>
        </div>

        <div className="inventory-stat-card">
          <span>Out of Stock</span>

          <strong>
            {outOfStockItems}
          </strong>

          <small>
            Items with zero quantity
          </small>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="inventory-error">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="inventory-success">
          {success}
        </div>
      )}

      {/* RECEIVE INVENTORY */}

      {manager && showReceiveForm && (

        <div className="inventory-form-card">

          <div className="inventory-form-header">

            <div>
              <h2>
                Receive Inventory
              </h2>

              <p>
                Add incoming stock to a warehouse and
                record the receipt.
              </p>
            </div>

          </div>

          <form onSubmit={handleReceive}>

            <div className="inventory-form-grid">

              <div className="inventory-form-group">

                <label htmlFor="receiveProductId">
                  Product
                </label>

                <select
                  id="receiveProductId"
                  name="productId"
                  value={receiveFormData.productId}
                  onChange={handleReceiveChange}
                  required
                >

                  <option value="">
                    Select a product
                  </option>

                  {products
                    .filter(
                      (product) =>
                        product.isActive
                    )
                    .map((product) => (

                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} ({product.sku})
                      </option>

                    ))}

                </select>

              </div>

              <div className="inventory-form-group">

                <label htmlFor="receiveWarehouseId">
                  Warehouse
                </label>

                <select
                  id="receiveWarehouseId"
                  name="warehouseId"
                  value={receiveFormData.warehouseId}
                  onChange={handleReceiveChange}
                  required
                >

                  <option value="">
                    Select a warehouse
                  </option>

                  {warehouses
                    .filter(
                      (warehouse) =>
                        warehouse.isActive
                    )
                    .map((warehouse) => (

                      <option
                        key={warehouse.id}
                        value={warehouse.id}
                      >
                        {warehouse.name} (
                        {warehouse.code})
                      </option>

                    ))}

                </select>

              </div>

              <div className="inventory-form-group">

                <label htmlFor="receiveQuantity">
                  Quantity Received
                </label>

                <input
                  id="receiveQuantity"
                  type="number"
                  name="quantity"
                  min="1"
                  value={receiveFormData.quantity}
                  onChange={handleReceiveChange}
                  placeholder="Enter quantity"
                  required
                />

              </div>

              <div className="inventory-form-group">

                <label htmlFor="receiveReorderLevel">
                  Reorder Level
                </label>

                <input
                  id="receiveReorderLevel"
                  type="number"
                  name="reorderLevel"
                  min="0"
                  value={receiveFormData.reorderLevel}
                  onChange={handleReceiveChange}
                  required
                />

              </div>

              <div className="inventory-form-group">

                <label htmlFor="receiveReferenceNumber">
                  Reference Number
                </label>

                <input
                  id="receiveReferenceNumber"
                  type="text"
                  name="referenceNumber"
                  value={
                    receiveFormData.referenceNumber
                  }
                  onChange={handleReceiveChange}
                  placeholder="PO-1001"
                />

              </div>

              <div className="inventory-form-group">

                <label htmlFor="receiveNotes">
                  Notes
                </label>

                <input
                  id="receiveNotes"
                  type="text"
                  name="notes"
                  value={receiveFormData.notes}
                  onChange={handleReceiveChange}
                  placeholder="Initial shipment"
                />

              </div>

            </div>

            <div className="inventory-form-actions">

              <button
                type="submit"
                className="inventory-primary-button"
              >
                Receive Inventory
              </button>

              <button
                type="button"
                className="inventory-secondary-button"
                onClick={closeReceiveForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}

      {/* SHIP INVENTORY */}

      {manager && showShipForm && (

        <div className="inventory-form-card inventory-ship-form-card">

          <div className="inventory-form-header">

            <div>
              <h2>
                Ship Inventory
              </h2>

              <p>
                Remove stock from a warehouse and record
                the shipment.
              </p>
            </div>

          </div>

          <form onSubmit={handleShip}>

            <div className="inventory-form-grid">

              <div className="inventory-form-group">

                <label htmlFor="shipProductId">
                  Product
                </label>

                <select
                  id="shipProductId"
                  name="productId"
                  value={shipFormData.productId}
                  onChange={handleShipChange}
                  required
                >

                  <option value="">
                    Select a product
                  </option>

                  {products
                    .filter(
                      (product) =>
                        product.isActive
                    )
                    .map((product) => (

                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} ({product.sku})
                      </option>

                    ))}

                </select>

              </div>

              <div className="inventory-form-group">

                <label htmlFor="shipWarehouseId">
                  Warehouse
                </label>

                <select
                  id="shipWarehouseId"
                  name="warehouseId"
                  value={shipFormData.warehouseId}
                  onChange={handleShipChange}
                  required
                >

                  <option value="">
                    Select warehouse
                  </option>

                  {warehouses
                    .filter(
                      (warehouse) =>
                        warehouse.isActive
                    )
                    .map((warehouse) => (

                      <option
                        key={warehouse.id}
                        value={warehouse.id}
                      >
                        {warehouse.name} (
                        {warehouse.code})
                      </option>

                    ))}

                </select>

              </div>

              <div className="inventory-form-group">

                <label htmlFor="shipQuantity">
                  Quantity to Ship
                </label>

                <input
                  id="shipQuantity"
                  type="number"
                  name="quantity"
                  min="1"
                  value={shipFormData.quantity}
                  onChange={handleShipChange}
                  placeholder="Enter quantity"
                  required
                />

              </div>

              <div className="inventory-form-group">

                <label htmlFor="shipReferenceNumber">
                  Reference Number
                </label>

                <input
                  id="shipReferenceNumber"
                  type="text"
                  name="referenceNumber"
                  value={
                    shipFormData.referenceNumber
                  }
                  onChange={handleShipChange}
                  placeholder="SO-1001"
                />

              </div>

              <div className="inventory-form-group inventory-form-full-width">

                <label htmlFor="shipNotes">
                  Notes
                </label>

                <input
                  id="shipNotes"
                  type="text"
                  name="notes"
                  value={shipFormData.notes}
                  onChange={handleShipChange}
                  placeholder="Customer order / shipment details"
                />

              </div>

            </div>

            <div className="inventory-form-actions">

              <button
                type="submit"
                className="inventory-primary-button"
              >
                Ship Inventory
              </button>

              <button
                type="button"
                className="inventory-secondary-button"
                onClick={closeShipForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}

      {/* EDIT INVENTORY */}

      {manager && editingInventory && (

        <div className="inventory-form-card">

          <div className="inventory-form-header">

            <div>
              <h2>
                Adjust Inventory
              </h2>

              <p>
                {editingInventory.productName} —{" "}
                {editingInventory.warehouseName}
              </p>
            </div>

          </div>

          <form onSubmit={handleUpdate}>

            <div className="inventory-form-grid">

              <div className="inventory-form-group">

                <label htmlFor="quantity">
                  Quantity
                </label>

                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="inventory-form-group">

                <label htmlFor="reorderLevel">
                  Reorder Level
                </label>

                <input
                  id="reorderLevel"
                  type="number"
                  name="reorderLevel"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            <div className="inventory-form-actions">

              <button
                type="submit"
                className="inventory-primary-button"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="inventory-secondary-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}

      {/* SEARCH / FILTER */}

      <div className="inventory-filters">

        <div className="inventory-search">

          <label htmlFor="inventorySearch">
            Search Inventory
          </label>

          <input
            id="inventorySearch"
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search by product or warehouse..."
          />

        </div>

        <div className="inventory-status-filter">

          <label htmlFor="inventoryFilter">
            Stock Status
          </label>

          <select
            id="inventoryFilter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >

            <option value="all">
              All Inventory
            </option>

            <option value="low">
              Low Stock
            </option>

            <option value="in-stock">
              In Stock
            </option>

          </select>

        </div>

      </div>

      {/* TABLE */}

      <div className="inventory-table-card">

        <div className="inventory-table-header">

          <div>

            <h2>
              Inventory Overview
            </h2>

            <p>
              {filteredInventory.length} inventory record
              {filteredInventory.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

        </div>

        {filteredInventory.length === 0 ? (

          <div className="inventory-empty">

            <h3>
              No inventory found
            </h3>

            <p>
              Try changing your search or stock status
              filter.
            </p>

          </div>

        ) : (

          <div className="inventory-table-wrapper">

            <table className="inventory-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Warehouse
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Reorder Level
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Last Updated
                  </th>

                  {manager && (
                    <th>
                      Actions
                    </th>
                  )}

                </tr>

              </thead>

              <tbody>

                {filteredInventory.map((item) => (

                  <tr key={item.id}>

                    <td>
                      <span className="inventory-product">
                        {item.productName}
                      </span>
                    </td>

                    <td>
                      <span className="inventory-warehouse">
                        {item.warehouseName}
                      </span>
                    </td>

                    <td>

                      <span
                        className={
                          item.quantity === 0
                            ? "inventory-quantity inventory-quantity-empty"
                            : item.isLowStock
                              ? "inventory-quantity inventory-quantity-low"
                              : "inventory-quantity"
                        }
                      >
                        {item.quantity}
                      </span>

                    </td>

                    <td>
                      {item.reorderLevel}
                    </td>

                    <td>

                      {item.quantity === 0 ? (

                        <span className="inventory-status inventory-status-out">
                          Out of Stock
                        </span>

                      ) : item.isLowStock ? (

                        <span className="inventory-status inventory-status-low">
                          Low Stock
                        </span>

                      ) : (

                        <span className="inventory-status inventory-status-good">
                          In Stock
                        </span>

                      )}

                    </td>

                    <td>

                      <span className="inventory-date">

                        {new Date(
                          item.lastUpdated
                        ).toLocaleString()}

                      </span>

                    </td>

                    {manager && (

                      <td>

                        <button
                          className="inventory-action-button"
                          onClick={() =>
                            handleEditClick(item)
                          }
                        >
                          Adjust
                        </button>

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

export default InventoryPage;