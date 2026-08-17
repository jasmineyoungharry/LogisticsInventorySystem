import { jwtDecode } from "jwt-decode";

export function getCurrentUser() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);

    return {
      id: decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],

      email: decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ],

      role: decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ]
    };
  } catch (error) {
    console.error("Failed to decode authentication token:", error);

    return null;
  }
}

export function isManager() {
  const user = getCurrentUser();

  return user?.role === "Manager";
}