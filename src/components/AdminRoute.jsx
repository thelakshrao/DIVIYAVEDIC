import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./Firebase";

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.email) {
        setLoading(false);
        return;
      }

      // ⭐ CACHE RESULT
      const cachedRole = localStorage.getItem("role");
      if (cachedRole) {
        setIsAdmin(cachedRole === "admin");
        setLoading(false);
        return;
      }

      const docRef = doc(db, "users", user.email);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const role = snap.data().role;
        localStorage.setItem("role", role); // ⭐ cache
        setIsAdmin(role === "admin");
      }

      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) return <h2>Checking Admin...</h2>;
  if (!isAdmin) return <Navigate to="/" />;

  return children;
};

export default AdminRoute;
