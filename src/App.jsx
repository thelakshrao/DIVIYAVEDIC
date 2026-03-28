import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import Footer from "./components/Footer";

const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));
const Admin = lazy(() => import("./components/Admindashboard"));
const Buy = lazy(() => import("./components/Buy"));     
const Shop = lazy(() => import("./components/ShopPage"));

const App = () => {
  return (
    <Router>
      <Navbar />
      <Suspense fallback={<h2 style={{ textAlign: "center" }}>Loading...</h2>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<Profile />} />
          <Route path="/buy/:id" element={<Buy />} />     {/* ✅ Add this */}
          <Route path="/shop" element={<Shop />} />       {/* ✅ Add this */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Routes>
      </Suspense>
      <Footer />
    </Router>
  );
};

export default App;