import { useEffect, useState } from "react";
import api from "../api/api";

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const loadTransactions = async () => {
    try {
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

  const filteredTransactions = transactions.filter((transaction) => {
    if (typeFilter === "all") {
      return true;
    }

    return transaction.transactionType === typeFilter;
  });

  if (loading) {
    return <h1>Loading transactions...</h1>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p>
            View the history of inventory activity.
          </p>
        </div>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      <div className="filter-container">
        <label htmlFor="transactionFilter">
          Type:
        </label>

        <select
          id="transactionFilter"
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value)
          }
        >
          <option value="all">All</option>
          <option value="RECEIPT">Receipt</option>
          <option value="SHIPMENT">Shipment</option>
          <option value="ADJUSTMENT">Adjustment</option>
          <option value="TRANSFER_IN">Transfer In</option>
          <option value="TRANSFER_OUT">Transfer Out</option>
        </select>
      </div>

      <div className="table-container">
        <table>
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
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  {new Date(
                    transaction.createdAt
                  ).toLocaleString()}
                </td>

                <td>
                  {transaction.productName}
                </td>

                <td>
                  {transaction.warehouseName}
                </td>

                <td>
                  {transaction.transactionType}
                </td>

                <td>
                  {transaction.quantityChange > 0
                    ? `+${transaction.quantityChange}`
                    : transaction.quantityChange}
                </td>

                <td>
                  {transaction.referenceNumber || "-"}
                </td>

                <td>
                  {transaction.notes || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionsPage;