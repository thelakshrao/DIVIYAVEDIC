import React, { Suspense, lazy } from "react";
import ScrollToTop from "./components/ScrollToTop";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import Footer from "./components/Footer";
const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));
const Admin = lazy(() => import("./components/Admindashboard"));
const Buy = lazy(() => import("./components/Buy"));     
const Shop = lazy(() => import("./components/ShopPage"));
const Youroder = lazy(() => import("./components/YourOrders"));

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<h2 style={{ textAlign: "center" }}>Loading...</h2>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<Profile />} />
          <Route path="/buy/:id" element={<Buy />} />     
          <Route path="/shop" element={<Shop />} />       
          <Route path="/orders" element={<Youroder />} />       
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