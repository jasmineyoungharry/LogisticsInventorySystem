import { useEffect, useState } from "react";
import api from "../api/api";
import "./TransactionsPage.css";

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadTransactions = async () => {
    try {
      setError("");

      const response = await api.get("/inventorytransactions");

      setTransactions(response.data);
    } catch (error) {
      console.error(error);
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter(
    (transaction) => {
      const matchesType =
        typeFilter === "all" ||
        transaction.transactionType === typeFilter;

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        search === "" ||
        transaction.productName
          .toLowerCase()
          .includes(search) ||
        transaction.warehouseName
          .toLowerCase()
          .includes(search) ||
        (transaction.referenceNumber || "")
          .toLowerCase()
          .includes(search) ||
        (transaction.notes || "")
          .toLowerCase()
          .includes(search);

      return matchesType && matchesSearch;
    }
  );

  const receivedTransactions = transactions.filter(
    (transaction) =>
      transaction.transactionType === "RECEIPT" ||
      transaction.transactionType === "TRANSFER_IN"
  ).length;

  const outgoingTransactions = transactions.filter(
    (transaction) =>
      transaction.transactionType === "SHIPMENT" ||
      transaction.transactionType === "TRANSFER_OUT"
  ).length;

  const adjustmentTransactions = transactions.filter(
    (transaction) =>
      transaction.transactionType === "ADJUSTMENT"
  ).length;

  const formatTransactionType = (type) => {
    switch (type) {
      case "RECEIPT":
        return "Receipt";

      case "SHIPMENT":
        return "Shipment";

      case "ADJUSTMENT":
        return "Adjustment";

      case "TRANSFER_IN":
        return "Transfer In";

      case "TRANSFER_OUT":
        return "Transfer Out";

      default:
        return type;
    }
  };

  const getTransactionClass = (type) => {
    switch (type) {
      case "RECEIPT":
      case "TRANSFER_IN":
        return "transactions-type transactions-type-in";

      case "SHIPMENT":
      case "TRANSFER_OUT":
        return "transactions-type transactions-type-out";

      case "ADJUSTMENT":
        return "transactions-type transactions-type-adjustment";

      default:
        return "transactions-type";
    }
  };

  if (loading) {
    return (
      <div className="transactions-page">
        <div className="transactions-header">
          <div>
            <h1>Transactions</h1>
            <p>
              View the history of inventory activity.
            </p>
          </div>
        </div>

        <div className="transactions-loading">
          Loading transactions...
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-page">

      {/* HEADER */}

      <div className="transactions-header">
        <div>
          <h1>Transactions</h1>

          <p>
            Track inventory movements and adjustments across
            your warehouses.
          </p>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="transactions-summary">

        <div className="transactions-stat-card">
          <span>Total Transactions</span>

          <strong>{transactions.length}</strong>

          <small>
            Recorded inventory activity
          </small>
        </div>

        <div className="transactions-stat-card">
          <span>Incoming Activity</span>

          <strong>{receivedTransactions}</strong>

          <small>
            Receipts and transfers in
          </small>
        </div>

        <div className="transactions-stat-card">
          <span>Outgoing Activity</span>

          <strong>{outgoingTransactions}</strong>

          <small>
            Shipments and transfers out
          </small>
        </div>

      </div>

      {/* SECONDARY SUMMARY */}

      <div className="transactions-secondary-summary">

        <span>
          {adjustmentTransactions} adjustment
          {adjustmentTransactions !== 1 ? "s" : ""}
          {" "}recorded
        </span>

        <span>
          Showing {filteredTransactions.length} of{" "}
          {transactions.length} transactions
        </span>

      </div>

      {/* ERROR */}

      {error && (
        <div className="transactions-error">
          {error}
        </div>
      )}

      {/* FILTERS */}

      <div className="transactions-filters">

        <div className="transactions-search">
          <label htmlFor="transactionSearch">
            Search Transactions
          </label>

          <input
            id="transactionSearch"
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search by product, warehouse, reference, or notes..."
          />
        </div>

        <div className="transactions-type-filter">
          <label htmlFor="transactionFilter">
            Transaction Type
          </label>

          <select
            id="transactionFilter"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
          >
            <option value="all">
              All Transactions
            </option>

            <option value="RECEIPT">
              Receipt
            </option>

            <option value="SHIPMENT">
              Shipment
            </option>

            <option value="ADJUSTMENT">
              Adjustment
            </option>

            <option value="TRANSFER_IN">
              Transfer In
            </option>

            <option value="TRANSFER_OUT">
              Transfer Out
            </option>
          </select>
        </div>

      </div>

      {/* TABLE */}

      <div className="transactions-table-card">

        <div className="transactions-table-header">

          <div>
            <h2>Transaction History</h2>

            <p>
              Inventory activity and audit history
            </p>
          </div>

        </div>

        {filteredTransactions.length === 0 ? (

          <div className="transactions-empty">
            <h3>No transactions found</h3>

            <p>
              Try changing your search or transaction type
              filter.
            </p>
          </div>

        ) : (

          <div className="transactions-table-wrapper">

            <table className="transactions-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>Type</th>
                  <th>Quantity Change</th>
                  <th>Reference</th>
                  <th>Notes</th>
                </tr>
              </thead>

              <tbody>

                {filteredTransactions.map(
                  (transaction) => (

                    <tr key={transaction.id}>

                      <td>
                        <span className="transactions-date">
                          {new Date(
                            transaction.createdAt
                          ).toLocaleString()}
                        </span>
                      </td>

                      <td>
                        <span className="transactions-product">
                          {transaction.productName}
                        </span>
                      </td>

                      <td>
                        <span className="transactions-warehouse">
                          {transaction.warehouseName}
                        </span>
                      </td>

                      <td>
                        <span
                          className={getTransactionClass(
                            transaction.transactionType
                          )}
                        >
                          {formatTransactionType(
                            transaction.transactionType
                          )}
                        </span>
                      </td>

                      <td>

                        <span
                          className={
                            transaction.quantityChange > 0
                              ? "transactions-quantity transactions-quantity-positive"
                              : transaction.quantityChange < 0
                                ? "transactions-quantity transactions-quantity-negative"
                                : "transactions-quantity"
                          }
                        >
                          {transaction.quantityChange > 0
                            ? `+${transaction.quantityChange}`
                            : transaction.quantityChange}
                        </span>

                      </td>

                      <td>
                        <span className="transactions-reference">
                          {transaction.referenceNumber || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="transactions-notes">
                          {transaction.notes || "-"}
                        </span>
                      </td>

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

export default TransactionsPage;