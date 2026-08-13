import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let userEmail = "";
  let userRole = "";

  if (token) {
    try {
      const decodedToken = jwtDecode(token);

      userEmail =
        decodedToken[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ];

      userRole =
        decodedToken[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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

      <div className="sidebar-user">
        <div className="user-email">
          {userEmail}
        </div>

        <div className="user-role">
          {userRole}
        </div>
      </div>

      <button
        className="logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;