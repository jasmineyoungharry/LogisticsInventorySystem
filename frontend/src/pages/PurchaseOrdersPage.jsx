import { useEffect, useState } from "react";
import api from "../api/api";

function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receivingId, setReceivingId] = useState(null);

  const [formData, setFormData] = useState({
    supplierId: "",
    warehouseId: "",
    purchaseOrderNumber: "",
    expectedDate: "",
    notes: "",
  });

  const [items, setItems] = useState([
    {
      productId: "",
      quantity: "",
      unitCost: "",
    },
  ]);

  // LOAD DATA

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        purchaseOrdersResponse,
        suppliersResponse,
        warehousesResponse,
        productsResponse,
      ] = await Promise.all([
        api.get("/purchaseorders"),
        api.get("/suppliers"),
        api.get("/warehouses"),
        api.get("/products"),
      ]);

      setPurchaseOrders(purchaseOrdersResponse.data);
      setSuppliers(suppliersResponse.data);
      setWarehouses(warehousesResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error(error);
      setError("Failed to load purchase order data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // FORM HANDLING

  const handleFormChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleItemChange = (index, event) => {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      [event.target.name]: event.target.value,
    };

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: "",
        unitCost: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems(
      items.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  const resetForm = () => {
    setFormData({
      supplierId: "",
      warehouseId: "",
      purchaseOrderNumber: "",
      expectedDate: "",
      notes: "",
    });

    setItems([
      {
        productId: "",
        quantity: "",
        unitCost: "",
      },
    ]);
  };

  // CREATE PURCHASE ORDER

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");

      const invalidItem = items.some(
        (item) =>
          !item.productId ||
          Number(item.quantity) <= 0 ||
          Number(item.unitCost) < 0
      );

      if (invalidItem) {
        setError(
          "Please make sure every item has a product, a quantity greater than 0, and a valid unit cost."
        );
        return;
      }

      if (!formData.supplierId) {
        setError("Please select a supplier.");
        return;
      }

      if (!formData.warehouseId) {
        setError("Please select a warehouse.");
        return;
      }

      if (!formData.purchaseOrderNumber.trim()) {
        setError(
          "Please enter a purchase order number."
        );
        return;
      }

      const purchaseOrderData = {
        supplierId: Number(formData.supplierId),

        warehouseId: Number(formData.warehouseId),

        purchaseOrderNumber:
          formData.purchaseOrderNumber.trim(),

        expectedDate: formData.expectedDate
          ? new Date(
              `${formData.expectedDate}T00:00:00`
            ).toISOString()
          : null,

        notes: formData.notes.trim(),

        items: items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
        })),
      };

      await api.post(
        "/purchaseorders",
        purchaseOrderData
      );

      setSuccess(
        "Purchase order created successfully."
      );

      resetForm();
      setShowForm(false);

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to create purchase order."
      );
    }
  };

  // CALCULATE FORM TOTAL

  const calculateFormTotal = () => {
    return items.reduce((total, item) => {
      const quantity =
        Number(item.quantity) || 0;

      const unitCost =
        Number(item.unitCost) || 0;

      return total + quantity * unitCost;
    }, 0);
  };

  // STATUS CLASS

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";

      case "RECEIVED":
        return "status-active";

      case "CANCELLED":
        return "status-inactive";

      default:
        return "";
    }
  };

  // VIEW PURCHASE ORDER

  const handleViewOrder = async (id) => {
    try {
      setError("");
      setSuccess("");

      const response = await api.get(
        `/purchaseorders/${id}`
      );

      setSelectedOrder(response.data);
    } catch (error) {
      console.error(error);

      setError(
        "Failed to load purchase order details."
      );
    }
  };

  // RECEIVE PURCHASE ORDER

  const handleReceiveOrder = async (order) => {
    if (order.status === "RECEIVED") {
      setError(
        "This purchase order has already been received."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to receive purchase order ${order.purchaseOrderNumber}?\n\n` +
        `This will add the ordered quantities to ${order.warehouseName} and mark the purchase order as RECEIVED.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      setReceivingId(order.id);

      const response = await api.post(
        `/purchaseorders/${order.id}/receive`
      );

      setSuccess(
        response.data?.message ||
          "Purchase order received successfully."
      );

      // Refresh purchase order list
      await loadData();

      // Refresh currently selected order if open
      if (selectedOrder?.id === order.id) {
        const updatedOrder = await api.get(
          `/purchaseorders/${order.id}`
        );

        setSelectedOrder(updatedOrder.data);
      }
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to receive purchase order."
      );
    } finally {
      setReceivingId(null);
    }
  };

  // CLOSE DETAILS

  const closeDetails = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return <h1>Loading purchase orders...</h1>;
  }

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>Purchase Orders</h1>

          <p>
            Create and manage purchase orders from
            suppliers.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
        >
          {showForm
            ? "Cancel"
            : "+ New Purchase Order"}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* CREATE PURCHASE ORDER FORM */}

      {showForm && (
        <div className="form-card">
          <h2>Create Purchase Order</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              {/* SUPPLIER */}

              <div className="form-group">
                <label>Supplier</label>

                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select supplier
                  </option>

                  {suppliers
                    .filter(
                      (supplier) =>
                        supplier.isActive !== false
                    )
                    .map((supplier) => (
                      <option
                        key={supplier.id}
                        value={supplier.id}
                      >
                        {supplier.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* WAREHOUSE */}

              <div className="form-group">
                <label>
                  Receiving Warehouse
                </label>

                <select
                  name="warehouseId"
                  value={formData.warehouseId}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">
                    Select warehouse
                  </option>

                  {warehouses
                    .filter(
                      (warehouse) =>
                        warehouse.isActive !== false
                    )
                    .map((warehouse) => (
                      <option
                        key={warehouse.id}
                        value={warehouse.id}
                      >
                        {warehouse.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* PO NUMBER */}

              <div className="form-group">
                <label>
                  Purchase Order Number
                </label>

                <input
                  type="text"
                  name="purchaseOrderNumber"
                  value={
                    formData.purchaseOrderNumber
                  }
                  onChange={handleFormChange}
                  placeholder="PO-0001"
                  required
                />
              </div>

              {/* EXPECTED DATE */}

              <div className="form-group">
                <label>Expected Date</label>

                <input
                  type="date"
                  name="expectedDate"
                  value={formData.expectedDate}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            {/* NOTES */}

            <div className="form-group">
              <label>Notes</label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                rows="3"
                placeholder="Optional notes..."
              />
            </div>

            {/* ITEMS */}

            <div className="purchase-order-items">
              <div className="section-header">
                <h3>Order Items</h3>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={addItem}
                >
                  + Add Item
                </button>
              </div>

              {items.map((item, index) => (
                <div
                  className="purchase-order-item"
                  key={index}
                >
                  {/* PRODUCT */}

                  <div className="form-group">
                    <label>Product</label>

                    <select
                      name="productId"
                      value={item.productId}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          event
                        )
                      }
                      required
                    >
                      <option value="">
                        Select product
                      </option>

                      {products
                        .filter(
                          (product) =>
                            product.isActive !== false
                        )
                        .map((product) => (
                          <option
                            key={product.id}
                            value={product.id}
                          >
                            {product.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* QUANTITY */}

                  <div className="form-group">
                    <label>Quantity</label>

                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          event
                        )
                      }
                      min="1"
                      required
                    />
                  </div>

                  {/* UNIT COST */}

                  <div className="form-group">
                    <label>Unit Cost</label>

                    <input
                      type="number"
                      name="unitCost"
                      value={item.unitCost}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          event
                        )
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* ITEM TOTAL */}

                  <div className="form-group">
                    <label>Total</label>

                    <input
                      type="text"
                      value={(
                        (Number(item.quantity) ||
                          0) *
                        (Number(item.unitCost) ||
                          0)
                      ).toFixed(2)}
                      readOnly
                    />
                  </div>

                  {/* REMOVE */}

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() =>
                      removeItem(index)
                    }
                    disabled={items.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}

              {/* ORDER TOTAL */}

              <div className="purchase-order-total">
                <strong>
                  Order Total: $
                  {calculateFormTotal().toFixed(2)}
                </strong>
              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="primary-button"
            >
              Create Purchase Order
            </button>
          </form>
        </div>
      )}

      {/* PURCHASE ORDER LIST */}

      <div className="dashboard-section">
        <h2>Purchase Order List</h2>

        {purchaseOrders.length === 0 ? (
          <p>
            No purchase orders have been created yet.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Warehouse</th>
                  <th>Order Date</th>
                  <th>Expected Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {purchaseOrders.map((order) => (
                  <tr key={order.id}>

                    {/* PO NUMBER */}

                    <td>
                      <strong>
                        {order.purchaseOrderNumber}
                      </strong>
                    </td>

                    {/* SUPPLIER */}

                    <td>
                      {order.supplierName}
                    </td>

                    {/* WAREHOUSE */}

                    <td>
                      {order.warehouseName}
                    </td>

                    {/* ORDER DATE */}

                    <td>
                      {new Date(
                        order.orderDate
                      ).toLocaleDateString()}
                    </td>

                    {/* EXPECTED DATE */}

                    <td>
                      {order.expectedDate
                        ? new Date(
                            order.expectedDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* ITEMS */}

                    <td>
                      {order.items?.length || 0}
                    </td>

                    {/* TOTAL */}

                    <td>
                      $
                      {Number(
                        order.totalAmount || 0
                      ).toFixed(2)}
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={getStatusClass(
                          order.status
                        )}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="action-buttons">

                        {/* VIEW */}

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            handleViewOrder(
                              order.id
                            )
                          }
                        >
                          View
                        </button>

                        {/* RECEIVE */}

                        {order.status ===
                          "PENDING" && (
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() =>
                              handleReceiveOrder(
                                order
                              )
                            }
                            disabled={
                              receivingId ===
                              order.id
                            }
                          >
                            {receivingId ===
                            order.id
                              ? "Receiving..."
                              : "Receive"}
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PURCHASE ORDER DETAILS */}

      {selectedOrder && (
        <div className="form-card">
          <div className="section-header">
            <div>
              <h2>
                Purchase Order Details
              </h2>

              <p>
                {selectedOrder.purchaseOrderNumber}
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={closeDetails}
            >
              Close
            </button>
          </div>

          {/* BASIC INFORMATION */}

          <div className="form-grid">

            <div className="form-group">
              <label>PO Number</label>

              <input
                type="text"
                value={
                  selectedOrder.purchaseOrderNumber
                }
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Supplier</label>

              <input
                type="text"
                value={
                  selectedOrder.supplierName
                }
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Warehouse</label>

              <input
                type="text"
                value={
                  selectedOrder.warehouseName
                }
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Status</label>

              <input
                type="text"
                value={
                  selectedOrder.status
                }
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Order Date</label>

              <input
                type="text"
                value={
                  selectedOrder.orderDate
                    ? new Date(
                        selectedOrder.orderDate
                      ).toLocaleDateString()
                    : "-"
                }
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Expected Date</label>

              <input
                type="text"
                value={
                  selectedOrder.expectedDate
                    ? new Date(
                        selectedOrder.expectedDate
                      ).toLocaleDateString()
                    : "-"
                }
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Received Date</label>

              <input
                type="text"
                value={
                  selectedOrder.receivedAt
                    ? new Date(
                        selectedOrder.receivedAt
                      ).toLocaleString()
                    : "-"
                }
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Total Amount</label>

              <input
                type="text"
                value={`$${Number(
                  selectedOrder.totalAmount || 0
                ).toFixed(2)}`}
                readOnly
              />
            </div>
          </div>

          {/* NOTES */}

          <div className="form-group">
            <label>Notes</label>

            <textarea
              value={
                selectedOrder.notes || ""
              }
              readOnly
              rows="3"
            />
          </div>

          {/* ITEMS */}

          <div className="purchase-order-items">
            <div className="section-header">
              <h3>Order Items</h3>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedOrder.items?.map(
                    (item) => (
                      <tr key={item.id}>
                        <td>
                          {item.productName}
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td>
                          $
                          {Number(
                            item.unitCost || 0
                          ).toFixed(2)}
                        </td>

                        <td>
                          $
                          {Number(
                            item.totalCost || 0
                          ).toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* DETAILS TOTAL */}

            <div className="purchase-order-total">
              <strong>
                Total: $
                {Number(
                  selectedOrder.totalAmount || 0
                ).toFixed(2)}
              </strong>
            </div>
          </div>

          {/* RECEIVE FROM DETAILS */}

          {selectedOrder.status ===
            "PENDING" && (
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                handleReceiveOrder(
                  selectedOrder
                )
              }
              disabled={
                receivingId ===
                selectedOrder.id
              }
            >
              {receivingId ===
              selectedOrder.id
                ? "Receiving..."
                : "Receive Purchase Order"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PurchaseOrdersPage;