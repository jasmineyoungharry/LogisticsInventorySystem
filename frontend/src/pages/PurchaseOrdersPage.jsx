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

    setItems(items.filter((_, itemIndex) => itemIndex !== index));
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

  const calculateFormTotal = () => {
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitCost = Number(item.unitCost) || 0;

      return total + quantity * unitCost;
    }, 0);
  };

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

  if (loading) {
    return <h1>Loading purchase orders...</h1>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Purchase Orders</h1>

          <p>
            Create and manage purchase orders from suppliers.
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
          {showForm ? "Cancel" : "+ New Purchase Order"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h2>Create Purchase Order</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
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

              <div className="form-group">
                <label>Receiving Warehouse</label>

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

              <div className="form-group">
                <label>Purchase Order Number</label>

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

                  <div className="form-group">
                    <label>Total</label>

                    <input
                      type="text"
                      value={(
                        (Number(item.quantity) || 0) *
                        (Number(item.unitCost) || 0)
                      ).toFixed(2)}
                      readOnly
                    />
                  </div>

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

              <div className="purchase-order-total">
                <strong>
                  Order Total: $
                  {calculateFormTotal().toFixed(2)}
                </strong>
              </div>
            </div>

            <button
              type="submit"
              className="primary-button"
            >
              Create Purchase Order
            </button>
          </form>
        </div>
      )}

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
                </tr>
              </thead>

              <tbody>
                {purchaseOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>
                        {order.purchaseOrderNumber}
                      </strong>
                    </td>

                    <td>
                      {order.supplierName}
                    </td>

                    <td>
                      {order.warehouseName}
                    </td>

                    <td>
                      {new Date(
                        order.orderDate
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {order.expectedDate
                        ? new Date(
                            order.expectedDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      {order.items?.length || 0}
                    </td>

                    <td>
                      $
                      {Number(
                        order.totalAmount || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      <span
                        className={getStatusClass(
                          order.status
                        )}
                      >
                        {order.status}
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

export default PurchaseOrdersPage;