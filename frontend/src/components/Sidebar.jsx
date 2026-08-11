import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Logistics</h2>
        <span>Inventory System</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end>
          Dashboard
        </NavLink>

        <NavLink to="/products">
          Products
        </NavLink>

        <NavLink to="/warehouses">
          Warehouses
        </NavLink>

        <NavLink to="/inventory">
          Inventory
        </NavLink>

        <NavLink to="/transactions">
          Transactions
        </NavLink>

        <NavLink to="/transfers">
          Transfers
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;