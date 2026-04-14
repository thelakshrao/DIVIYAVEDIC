import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./Firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { imgUrl } from "../utils/cloudinary";

const FEATURES = [
  "Returnable",
  "Warranty",
  "COD Available",
  "Express Delivery",
  "Gift Wrap",
  "Lab Certified",
  "Energised",
  "Free Shipping",
  "International Shipping",
  "Authentic",
];
const CATEGORIES = [
  "Rudraksha",
  "Gemstones",
  "Yantras",
  "Bracelets",
  "Rings",
  "Pendants",
  "Puja Samagri",
  "Vastu",
  "Books",
  "Others",
];
const DELIVERY_DAYS = [
  "1-2 Days",
  "3-5 Days",
  "5-7 Days",
  "7-10 Days",
  "15+ Days",
];
const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const navItems = [
  { icon: "📊", label: "Overview", key: "overview" },
  { icon: "📦", label: "Orders", key: "orders" },
  { icon: "👥", label: "Customers", key: "customers" },
  { icon: "🛍️", label: "Products", key: "products" },
  { icon: "➕", label: "Upload Item", key: "upload" },
  { icon: "💰", label: "Revenue", key: "revenue" },
  { icon: "⚙️", label: "Settings", key: "settings" },
];

const EMPTY_FORM = {
  name: "",
  brand: "",
  category: CATEGORIES[0],
  description: "",
  price: "",
  mrp: "",
  stock: "",
  deliveryFee: "0",
  deliveryDays: DELIVERY_DAYS[0],
  features: [],
  weight: "",
  dimensions: "",
};

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Confirmed: "bg-blue-100   text-blue-700   border-blue-200",
  Processing: "bg-purple-100 text-purple-700 border-purple-200",
  Shipped: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Delivered: "bg-green-100  text-green-700  border-green-200",
  Cancelled: "bg-red-100    text-red-600    border-red-200",
};

const inputCls =
  "w-full box-border bg-white border border-amber-700/20 rounded-xl px-3.5 py-2.5 text-[13.5px] text-amber-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition-all placeholder:text-amber-700/25";
const selectCls =
  "w-full box-border bg-white border border-amber-700/20 rounded-xl px-3.5 py-2.5 text-[13.5px] text-amber-900 outline-none cursor-pointer appearance-none focus:border-amber-400 transition-all";
const textareaCls =
  "w-full box-border bg-white border border-amber-700/20 rounded-xl px-3.5 py-2.5 text-[13.5px] text-amber-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition-all placeholder:text-amber-700/25 resize-y min-h-[80px]";
const labelCls =
  "text-[11px] text-amber-700/60 tracking-widest uppercase font-semibold";
const thCls =
  "text-left text-[10px] tracking-widest uppercase text-amber-700/50 px-3.5 py-2.5 border-b border-amber-700/8 font-semibold whitespace-nowrap";
const tdCls =
  "px-3.5 py-3 text-[13px] text-amber-900/80 border-b border-amber-700/5";

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white border border-amber-700/10 rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden ${className}`}
  >
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <p className="font-['Cinzel',serif] text-sm font-semibold text-amber-900 mb-4">
    {children}
  </p>
);

const Modal = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent rounded-t-2xl" />
      {children}
    </div>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebar] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const fileInputRef = useRef();
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [ordersViewed, setOrdersViewed] = useState(
    () => sessionStorage.getItem("adminOrdersViewed") === "true",
  );

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [cusSnap, prodSnap, ordSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "products")),
        getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
      ]);
      setCustomers(cusSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setProducts(prodSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setOrders(ordSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNav = (key) => {
    setActiveNav(key);
    setSidebar(false);
    if (key === "orders") {
      setOrdersViewed(true);
      sessionStorage.setItem("adminOrdersViewed", "true");
    }
  };

  const activeOrdersCount = orders.filter(
    (o) => !["Delivered", "Cancelled"].includes(o.status),
  ).length;
  const newOrderBadge =
    !ordersViewed && activeOrdersCount > 0 ? activeOrdersCount : 0;

  const toast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setImages([]);
    setPreviews([]);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImages = (files) => {
    const arr = Array.from(files).slice(0, 6 - images.length);
    setImages((p) => [...p, ...arr]);
    setPreviews((p) => [...p, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (i) => {
    URL.revokeObjectURL(previews[i]);
    setImages((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const toggleFeature = (f, target = "form") => {
    const setter = target === "edit" ? setEditForm : setForm;
    setter((prev) => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter((x) => x !== f)
        : [...prev.features, f],
    }));
  };

  const uploadImagesToCloudinary = async () => {
    const cloudName = "dz3b1ivvf",
      uploadPreset = "diviyavedic_perset";
    const urls = [];
    for (let i = 0; i < images.length; i++) {
      const fd = new FormData();
      fd.append("file", images[i]);
      fd.append("upload_preset", uploadPreset);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: fd },
      );
      const data = await res.json();
      if (data.secure_url) {
        urls.push(data.secure_url);
        setUploadProgress(Math.round(((i + 1) / images.length) * 100));
      } else
        throw new Error(
          data.error?.message || `Upload failed for image ${i + 1}`,
        );
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please add at least one image.");
      return;
    }
    setUploading(true);
    setUploadProgress(10);
    try {
      const imageUrls = await uploadImagesToCloudinary();
      const productData = {
        ...form,
        price: Number(form.price),
        mrp: Number(form.mrp),
        stock: Number(form.stock),
        deliveryFee: Number(form.deliveryFee),
        images: imageUrls,
        createdAt: serverTimestamp(),
        purchases: 0,
        active: true,
      };
      const docRef = await addDoc(collection(db, "products"), productData);
      setProducts((p) => [{ id: docRef.id, ...productData }, ...p]);
      resetForm();
      toast("✦ Product uploaded successfully!");
      handleNav("products");
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setEditForm({
      name: p.name || "",
      brand: p.brand || "",
      category: p.category || CATEGORIES[0],
      description: p.description || "",
      price: p.price || "",
      mrp: p.mrp || "",
      stock: p.stock || "",
      deliveryFee: p.deliveryFee ?? 0,
      deliveryDays: p.deliveryDays || DELIVERY_DAYS[0],
      features: p.features || [],
      weight: p.weight || "",
      dimensions: p.dimensions || "",
    });
  };

  const saveEdit = async () => {
    if (!editProduct) return;
    setEditSaving(true);
    try {
      const updated = {
        ...editForm,
        price: Number(editForm.price),
        mrp: Number(editForm.mrp),
        stock: Number(editForm.stock),
        deliveryFee: Number(editForm.deliveryFee),
      };
      await updateDoc(doc(db, "products", editProduct.id), updated);
      setProducts((p) =>
        p.map((x) => (x.id === editProduct.id ? { ...x, ...updated } : x)),
      );
      setEditProduct(null);
      toast("✦ Product updated!");
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((p) => p.filter((x) => x.id !== id));
      toast("✦ Product deleted.");
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const toggleRole = async (customer) => {
    const newRole = customer.role === "admin" ? "customer" : "admin";
    if (
      !window.confirm(
        `Change ${customer.name || customer.email} to ${newRole}?`,
      )
    )
      return;
    try {
      await updateDoc(doc(db, "users", customer.id), { role: newRole });
      setCustomers((p) =>
        p.map((x) => (x.id === customer.id ? { ...x, role: newRole } : x)),
      );
      toast(`✦ Role updated to ${newRole}`);
    } catch (err) {
      alert("Role update failed: " + err.message);
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Remove this customer?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setCustomers((p) => p.filter((x) => x.id !== id));
      toast("✦ Customer removed.");
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        ...(newStatus === "Delivered"
          ? { deliveredAt: serverTimestamp() }
          : {}),
      });
      setOrders((p) =>
        p.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      toast(`✦ Order marked as ${newStatus}`);
    } catch (err) {
      alert("Status update failed: " + err.message);
    }
  };

  const completedOrders = orders.filter((o) => o.status === "Delivered");
  const totalRevenue = completedOrders.reduce(
    (s, o) => s + (o.total || o.grandTotal || 0),
    0,
  );

  const stats = [
    {
      label: "Customers",
      value: customers.length,
      icon: "👥",
      delta: `${customers.filter((c) => c.role === "admin").length} admins`,
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Products",
      value: products.length,
      icon: "🛍️",
      delta: "Active listings",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Orders",
      value: activeOrdersCount,
      icon: "📦",
      delta: `${completedOrders.length} delivered`,
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      label: "Revenue",
      value: `₹${totalRevenue}`,
      icon: "💰",
      delta: "Completed",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
  ];

  const renderUserTable = (list, isAdminTable) => {
    if (list.length === 0)
      return (
        <p className="font-['Cormorant_Garamond',serif] italic text-[13px] text-amber-700/40 text-center py-6">
          No {isAdminTable ? "admins" : "customers"} found.
        </p>
      );
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Name", "Email", "Phone", "Role", "Actions"].map((h) => (
                <th key={h} className={thCls}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const isAdmin = c.role === "admin";
              return (
                <tr key={c.id} className="hover:bg-amber-50/60">
                  <td className="px-3.5 py-3 text-[13px] text-amber-900 font-medium border-b border-amber-700/5">
                    {c.name || "—"}
                  </td>
                  <td className={tdCls}>{c.email}</td>
                  <td className={tdCls}>{c.phone || "—"}</td>
                  <td className="px-3.5 py-3 border-b border-amber-700/5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${isAdmin ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}
                    >
                      {isAdmin ? "Admin" : "Customer"}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 border-b border-amber-700/5">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => toggleRole(c)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${isAdmin ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"}`}
                      >
                        {isAdmin ? "→ Customer" : "→ Admin"}
                      </button>
                      <button
                        onClick={() => deleteCustomer(c.id)}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer transition-all bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeNav) {
      case "overview":
        return (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className={`${s.bg} ${s.border} border rounded-2xl p-3 sm:p-5 relative overflow-hidden shadow-sm`}
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
                  <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-xl sm:text-2xl opacity-20">
                    {s.icon}
                  </span>
                  <div className="font-['Cinzel',serif] text-2xl sm:text-3xl font-bold text-amber-800 leading-none mb-1">
                    {s.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-amber-700/50 tracking-widest uppercase font-medium">
                    {s.label}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-green-600 mt-1 sm:mt-1.5 font-medium">
                    {s.delta}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Card>
                <CardTitle>Recent Orders ({orders.length})</CardTitle>
                {orders.length === 0 ? (
                  <p className="font-['Cormorant_Garamond',serif] italic text-[13px] text-amber-700/40">
                    No orders yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          {["Order ID", "Customer", "Total", "Status"].map(
                            (h) => (
                              <th key={h} className={thCls}>
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.id} className="hover:bg-amber-50/60">
                            <td className="px-3.5 py-3 text-[11px] text-amber-700/60 border-b border-amber-700/5 font-['Cinzel',serif] font-semibold">
                              {o.orderId || o.id}
                            </td>
                            <td className={tdCls}>
                              {o.customerName || o.email || "—"}
                            </td>
                            <td className={tdCls}>
                              ₹{o.total || o.grandTotal || 0}
                            </td>
                            <td className={tdCls}>
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor[o.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                              >
                                {o.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
              <Card>
                <CardTitle>Recent Products</CardTitle>
                {products.length === 0 ? (
                  <p className="font-['Cormorant_Garamond',serif] italic text-[13px] text-amber-700/40">
                    No products yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          {["Image", "Name", "Price", "Stock"].map((h) => (
                            <th key={h} className={thCls}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {products.slice(0, 5).map((p) => (
                          <tr key={p.id} className="hover:bg-amber-50/60">
                            <td className="px-3.5 py-3 border-b border-amber-700/5">
                              {p.images?.[0] ? (
                                <img
                                  src={imgUrl(p.images[0], 80)}
                                  alt={p.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-amber-700/10"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-lg border border-amber-100">
                                  🛍️
                                </div>
                              )}
                            </td>
                            <td className={tdCls}>{p.name}</td>
                            <td className={tdCls}>₹{p.price}</td>
                            <td className={tdCls}>
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                              >
                                {p.stock > 0 ? `${p.stock} left` : "Out"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </div>
        );

      case "products":
        return (
          <Card>
            <div className="flex justify-between items-center mb-5">
              <p className="font-['Cinzel',serif] text-base font-semibold text-amber-900">
                All Products ({products.length})
              </p>
              <button
                onClick={() => handleNav("upload")}
                className="bg-linear-to-br from-amber-400 to-amber-600 text-white border-none px-4 sm:px-5 py-2 rounded-xl font-['Cinzel',serif] text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(245,158,11,0.35)] transition-all shadow-[0_4px_14px_rgba(245,158,11,0.25)] inline-flex items-center gap-1.5"
              >
                ➕ Upload New
              </button>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3 opacity-20">🛍️</div>
                <p className="font-['Cormorant_Garamond',serif] italic text-[15px] text-amber-700/35 mb-4">
                  No products yet.
                </p>
                <button
                  onClick={() => handleNav("upload")}
                  className="bg-linear-to-br from-amber-400 to-amber-600 text-white border-none px-5 py-2 rounded-xl font-['Cinzel',serif] text-[10px] font-bold uppercase cursor-pointer hover:-translate-y-px transition-all"
                >
                  Upload First Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {[
                        "Image",
                        "Name",
                        "Brand",
                        "Category",
                        "Price",
                        "Stock",
                        "Features",
                        "Actions",
                      ].map((h) => (
                        <th key={h} className={thCls}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-amber-50/60">
                        <td className="px-3.5 py-3 border-b border-amber-700/5">
                          {p.images?.[0] ? (
                            <img
                              src={imgUrl(p.images[0], 88)}
                              alt={p.name}
                              className="w-11 h-11 object-cover rounded-xl border border-amber-700/10"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-lg border border-amber-100">
                              🛍️
                            </div>
                          )}
                        </td>
                        <td className="px-3.5 py-3 text-[13px] text-amber-900 font-medium border-b border-amber-700/5 max-w-32.5">
                          <span className="block truncate">{p.name}</span>
                        </td>
                        <td className={tdCls}>{p.brand || "—"}</td>
                        <td className="px-3.5 py-3 border-b border-amber-700/5">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-amber-700 font-semibold border-b border-amber-700/5">
                          ₹{p.price}
                        </td>
                        <td className="px-3.5 py-3 border-b border-amber-700/5">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                          >
                            {p.stock > 0 ? p.stock + " left" : "Out"}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-[11px] text-amber-700/50 border-b border-amber-700/5 max-w-30">
                          <span className="block truncate">
                            {(p.features || []).slice(0, 2).join(", ")}
                            {(p.features || []).length > 2 ? "…" : ""}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 border-b border-amber-700/5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer transition-all bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer transition-all bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );

      case "orders":
        return (
          <Card>
            <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
              <CardTitle>All Orders ({orders.length})</CardTitle>
              <div className="flex gap-2 flex-wrap">
                {["Pending", "Processing", "Delivered", "Cancelled"].map(
                  (s) => (
                    <span
                      key={s}
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor[s]}`}
                    >
                      {orders.filter((o) => o.status === s).length} {s}
                    </span>
                  ),
                )}
              </div>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 opacity-20">📦</div>
                <p className="font-['Cinzel',serif] text-base text-amber-700/40 mb-2">
                  No Orders Yet
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {[
                        "Order ID",
                        "Customer",
                        "Items",
                        "Total",
                        "Date",
                        "Status",
                        "Change Status",
                      ].map((h) => (
                        <th key={h} className={thCls}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-amber-50/60">
                        <td className="px-3.5 py-3 text-[12px] text-amber-700 border-b border-amber-700/5 font-['Cinzel',serif] font-semibold">
                          {o.orderId || o.id}
                        </td>
                        <td className={tdCls}>
                          {o.customerName || o.email || "—"}
                        </td>
                        <td className={tdCls}>
                          {(o.items || []).length} item
                          {(o.items || []).length !== 1 ? "s" : ""}
                        </td>
                        <td className="px-3.5 py-3 text-amber-700 font-semibold border-b border-amber-700/5">
                          ₹{o.total || o.grandTotal || 0}
                        </td>
                        <td className="px-3.5 py-3 text-[12px] text-amber-700/50 border-b border-amber-700/5">
                          {o.createdAt
                            ?.toDate?.()
                            ?.toLocaleDateString?.("en-IN") || "—"}
                        </td>
                        <td className="px-3.5 py-3 border-b border-amber-700/5">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor[o.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                          >
                            {o.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 border-b border-amber-700/5">
                          <select
                            value={o.status || "Pending"}
                            onChange={(e) =>
                              updateOrderStatus(o.id, e.target.value)
                            }
                            className="text-[11px] bg-white border border-amber-700/20 rounded-lg px-2 py-1 text-amber-900 outline-none cursor-pointer focus:border-amber-400 transition-all"
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );

      case "customers": {
        const q = customerSearch.trim().toLowerCase();
        const filtered = q
          ? customers.filter(
              (c) =>
                (c.name || "").toLowerCase().includes(q) ||
                (c.email || "").toLowerCase().includes(q) ||
                (c.phone || "").toLowerCase().includes(q) ||
                (c.id || "").toLowerCase().includes(q),
            )
          : customers;
        const admins = filtered.filter((c) => c.role === "admin");
        const nonAdmins = filtered.filter((c) => c.role !== "admin");
        return (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-['Cinzel',serif] text-base font-semibold text-amber-900">
                  All Users ({customers.length})
                </h2>
                <p className="text-[12px] text-amber-700/45 mt-0.5">
                  Manage roles — changes reflect instantly in Firestore
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                  {customers.filter((c) => c.role === "admin").length} Admins
                </span>
                <span className="inline-flex px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                  {customers.filter((c) => c.role !== "admin").length} Customers
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search…"
                    className="pl-8 pr-3 py-2 text-[12px] bg-white border border-amber-700/20 rounded-xl text-amber-900 outline-none focus:border-amber-400 transition-all w-full sm:w-60 placeholder:text-amber-700/30"
                  />
                  {customerSearch && (
                    <button
                      onClick={() => setCustomerSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-700/40 hover:text-amber-700 bg-transparent border-none cursor-pointer text-xs leading-none"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                  ⚙️ Admins ({admins.length})
                </span>
                <div className="flex-1 h-px bg-amber-700/8" />
              </div>
              {renderUserTable(admins, true)}
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                  👤 Customers ({nonAdmins.length})
                </span>
                <div className="flex-1 h-px bg-amber-700/8" />
              </div>
              {renderUserTable(nonAdmins, false)}
            </Card>
          </div>
        );
      }

      case "revenue":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                {
                  label: "Total Revenue",
                  value: `₹${totalRevenue}`,
                  bg: "bg-green-50",
                  border: "border-green-100",
                  icon: "💰",
                },
                {
                  label: "Completed Orders",
                  value: completedOrders.length,
                  bg: "bg-blue-50",
                  border: "border-blue-100",
                  icon: "✅",
                },
                {
                  label: "Avg Order Value",
                  value: completedOrders.length
                    ? `₹${Math.round(totalRevenue / completedOrders.length)}`
                    : "₹0",
                  bg: "bg-amber-50",
                  border: "border-amber-100",
                  icon: "📈",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`${s.bg} ${s.border} border rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm`}
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
                  <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-xl sm:text-2xl opacity-20">
                    {s.icon}
                  </span>
                  <div className="font-['Cinzel',serif] text-2xl sm:text-3xl font-bold text-amber-800 leading-none mb-1">
                    {s.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-amber-700/50 tracking-widest uppercase font-medium">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <Card>
              <CardTitle>Completed Orders</CardTitle>
              {completedOrders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4 opacity-20">💰</div>
                  <p className="font-['Cinzel',serif] text-base text-amber-700/40">
                    No Revenue Yet
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {["Order ID", "Customer", "Items", "Total", "Date"].map(
                          (h) => (
                            <th key={h} className={thCls}>
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {completedOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-amber-50/60">
                          <td className="px-3.5 py-3 text-[12px] text-amber-700 border-b border-amber-700/5 font-['Cinzel',serif] font-semibold">
                            {o.orderId || o.id}
                          </td>
                          <td className={tdCls}>
                            {o.customerName || o.email || "—"}
                          </td>
                          <td className={tdCls}>{(o.items || []).length}</td>
                          <td className="px-3.5 py-3 text-amber-700 font-semibold border-b border-amber-700/5">
                            ₹{o.total || o.grandTotal || 0}
                          </td>
                          <td className="px-3.5 py-3 text-[12px] text-amber-700/50 border-b border-amber-700/5">
                            {o.createdAt
                              ?.toDate?.()
                              ?.toLocaleDateString?.("en-IN") || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        );

      case "upload":
        return (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
              <p className="font-['Cinzel',serif] text-[15px] font-semibold text-amber-900 mb-1">
                Product Images
              </p>
              <p className="text-xs text-amber-700/45 mb-4">
                Upload up to 6 images. First image is the cover.
              </p>
              <div
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${dragOver ? "border-amber-400 bg-amber-50" : "border-amber-700/15 hover:border-amber-400/50 hover:bg-amber-50/40"}`}
                onClick={() => fileInputRef.current.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleImages(e.dataTransfer.files);
                }}
              >
                <div className="text-3xl mb-2 opacity-40">📸</div>
                <p className="text-amber-700/50 text-[13px]">
                  Click or drag images here
                </p>
                <p className="text-amber-700/30 text-[11px] mt-1">
                  JPG, PNG, WEBP · Max 6 images
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImages(e.target.files)}
                />
              </div>
              {previews.length > 0 && (
                <div
                  className="grid gap-2.5 mt-3.5"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))",
                  }}
                >
                  {previews.map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden border border-amber-700/12"
                    >
                      <img
                        src={src}
                        alt={`preview-${i}`}
                        className="w-full h-full object-cover"
                      />
                      {i === 0 && (
                        <div className="absolute bottom-1 left-1 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg tracking-wide">
                          COVER
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-black/60 text-white border-none rounded-full w-5 h-5 cursor-pointer text-[10px] flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {uploading && (
                <div className="mt-3">
                  <p className="text-xs text-amber-700/50 mb-1">
                    Uploading… {uploadProgress}%
                  </p>
                  <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-amber-400 to-amber-600 rounded-full transition-[width_0.3s]"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
            <Card>
              <p className="font-['Cinzel',serif] text-[15px] font-semibold text-amber-900 mb-5">
                Basic Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    label: "Product Name *",
                    key: "name",
                    placeholder: "e.g. 5 Mukhi Rudraksha Mala",
                    required: true,
                  },
                  {
                    label: "Brand",
                    key: "brand",
                    placeholder: "e.g. Diviya Vedics",
                  },
                  {
                    label: "Weight (grams)",
                    key: "weight",
                    placeholder: "e.g. 25",
                    type: "number",
                  },
                ].map(({ label, key, placeholder, required, type }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className={labelCls}>{label}</label>
                    <input
                      className={inputCls}
                      required={required}
                      type={type || "text"}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Category *</label>
                  <select
                    className={selectCls}
                    value={form.category}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, category: e.target.value }))
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className={labelCls}>Description *</label>
                  <textarea
                    className={textareaCls}
                    required
                    placeholder="Describe the product…"
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                </div>
              </div>
            </Card>
            <Card>
              <p className="font-['Cinzel',serif] text-[15px] font-semibold text-amber-900 mb-5">
                Pricing &amp; Stock
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    label: "Selling Price (₹) *",
                    key: "price",
                    placeholder: "e.g. 1499",
                    required: true,
                    type: "number",
                  },
                  {
                    label: "MRP (₹)",
                    key: "mrp",
                    placeholder: "e.g. 1999",
                    type: "number",
                  },
                  {
                    label: "Stock Quantity *",
                    key: "stock",
                    placeholder: "e.g. 50",
                    required: true,
                    type: "number",
                  },
                  {
                    label: "Delivery Fee (₹)",
                    key: "deliveryFee",
                    placeholder: "0 for free",
                    type: "number",
                  },
                  {
                    label: "Dimensions",
                    key: "dimensions",
                    placeholder: "e.g. 20cm x 5cm",
                  },
                ].map(({ label, key, placeholder, required, type }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className={labelCls}>{label}</label>
                    <input
                      className={inputCls}
                      required={required}
                      type={type || "text"}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Estimated Delivery</label>
                  <select
                    className={selectCls}
                    value={form.deliveryDays}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, deliveryDays: e.target.value }))
                    }
                  >
                    {DELIVERY_DAYS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
            <Card>
              <p className="font-['Cinzel',serif] text-[15px] font-semibold text-amber-900 mb-1">
                Product Features
              </p>
              <p className="text-xs text-amber-700/35 mb-4">
                Selected features show as badges on product page.
              </p>
              <div className="flex flex-wrap gap-2">
                {FEATURES.map((f) => (
                  <div
                    key={f}
                    onClick={() => toggleFeature(f, "form")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-all border select-none ${form.features.includes(f) ? "bg-amber-400 text-white border-amber-500 shadow-sm" : "bg-white text-amber-700/60 border-amber-700/15 hover:border-amber-400/50 hover:text-amber-700"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${form.features.includes(f) ? "bg-white" : "bg-amber-400/40"}`}
                    />
                    {f}
                  </div>
                ))}
              </div>
            </Card>
            <div className="flex gap-3 items-center">
              <button
                type="submit"
                disabled={uploading}
                className={`bg-linear-to-br from-amber-400 to-amber-600 text-white border-none px-6 sm:px-9 py-3.5 rounded-xl font-['Cinzel',serif] text-[11px] font-bold tracking-widest uppercase cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(245,158,11,0.4)] transition-all shadow-[0_4px_20px_rgba(245,158,11,0.3)] flex items-center gap-2 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span>Uploading…</span>
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    <span>Upload Product</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleNav("products")}
                className="bg-transparent text-amber-700/50 border border-amber-700/15 px-4 sm:px-6 py-3.5 rounded-xl text-[13px] font-medium cursor-pointer hover:bg-amber-50 hover:border-amber-700/30 hover:text-amber-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        );

      default:
        return (
          <Card className="text-center py-20">
            <p className="font-['Cormorant_Garamond',serif] italic text-base text-amber-700/30">
              Coming soon.
            </p>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f0] flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebar(false)}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-60 bg-white border-r border-amber-700/10 flex flex-col py-7 shrink-0 overflow-y-auto shadow-sm z-100 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="px-6 pb-7 border-b border-amber-700/8">
          <div className="text-[28px] mb-1.5">ॐ</div>
          <p className="font-['Cinzel',serif] text-[13px] font-bold text-amber-700 tracking-wide">
            Diviya Vedics
          </p>
          <p className="text-[10px] text-amber-700/40 tracking-widest uppercase mt-0.5">
            Admin Panel
          </p>
        </div>
        <nav className="px-3 py-5 flex-1">
          {[
            { label: "Main", items: navItems.slice(0, 4) },
            { label: "Catalog", items: navItems.slice(4, 6) },
            { label: "System", items: navItems.slice(6) },
          ].map(({ label, items }) => (
            <div key={label}>
              <p className="text-[9px] tracking-widest uppercase text-amber-700/30 px-3 pt-4 pb-1.5 font-semibold">
                {label}
              </p>
              {items.map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-[13px] font-medium transition-all mb-0.5 ${activeNav === item.key ? "bg-amber-50 text-amber-700 font-semibold border border-amber-200 shadow-sm" : "text-amber-900/50 hover:bg-amber-50/70 hover:text-amber-700"}`}
                >
                  <span className="text-base w-5 text-center shrink-0">
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.key === "orders" && newOrderBadge > 0 && (
                    <span className="bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {newOrderBadge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-amber-700/8">
          <p className="text-[11px] text-amber-700/30 mb-2 tracking-wide">
            Logged in as
          </p>
          <button
            onClick={() => navigate("/account")}
            className="w-full bg-transparent border border-amber-700/15 text-amber-700/50 px-3 py-1.5 rounded-lg cursor-pointer text-[11px] hover:bg-amber-50 hover:text-amber-700 transition-colors mt-2.5"
          >
            ← Back to Profile
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-amber-700/10 px-4 h-14 flex items-center justify-between shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
          <button
            onClick={() => setSidebar(true)}
            className="w-9 h-9 rounded-lg border border-amber-700/18 bg-transparent cursor-pointer flex flex-col items-center justify-center gap-1 transition-all hover:bg-amber-50"
          >
            <span className="w-4 h-px bg-amber-700/60 block" />
            <span className="w-4 h-px bg-amber-700/60 block" />
            <span className="w-4 h-px bg-amber-700/60 block" />
          </button>
          <span className="font-['Cinzel',serif] text-[13px] font-bold text-amber-700 tracking-wide">
            {navItems.find((n) => n.key === activeNav)?.icon}{" "}
            {navItems.find((n) => n.key === activeNav)?.label}
          </span>
          <div className="w-9" />
        </div>
        <main className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-10 py-5 sm:py-6 lg:py-9">
          <div className="mb-5 sm:mb-8">
            <h1 className="font-['Cinzel',serif] text-[18px] sm:text-[22px] font-bold text-amber-900 m-0 mb-1">
              {navItems.find((n) => n.key === activeNav)?.icon}{" "}
              {navItems.find((n) => n.key === activeNav)?.label}
            </h1>
            <p className="text-[12px] sm:text-[13px] text-amber-700/45 m-0">
              {activeNav === "overview" && "Your store at a glance"}
              {activeNav === "upload" && "Add a new product to your store"}
              {activeNav === "products" && "Manage all your products"}
              {activeNav === "customers" && "Manage customers and roles"}
              {activeNav === "orders" && "Track and manage all orders"}
              {activeNav === "revenue" && "Financial overview"}
            </p>
          </div>
          {renderContent()}
        </main>
      </div>

      {editProduct && (
        <Modal onClose={() => setEditProduct(null)}>
          <div className="p-5 sm:p-6">
            <div className="flex justify-between items-center mb-5">
              <p className="font-['Cinzel',serif] text-base font-semibold text-amber-900">
                Edit Product
              </p>
              <button
                onClick={() => setEditProduct(null)}
                className="text-amber-700/40 hover:text-amber-700 text-xl cursor-pointer bg-transparent border-none leading-none"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Product Name *", key: "name", required: true },
                { label: "Brand", key: "brand" },
                { label: "Weight (grams)", key: "weight", type: "number" },
                {
                  label: "Selling Price (₹) *",
                  key: "price",
                  required: true,
                  type: "number",
                },
                { label: "MRP (₹)", key: "mrp", type: "number" },
                {
                  label: "Stock Quantity *",
                  key: "stock",
                  required: true,
                  type: "number",
                },
                {
                  label: "Delivery Fee (₹)",
                  key: "deliveryFee",
                  type: "number",
                },
                { label: "Dimensions", key: "dimensions" },
              ].map(({ label, key, required, type }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className={labelCls}>{label}</label>
                  <input
                    className={inputCls}
                    required={required}
                    type={type || "text"}
                    value={editForm[key]}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Category</label>
                <select
                  className={selectCls}
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, category: e.target.value }))
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Estimated Delivery</label>
                <select
                  className={selectCls}
                  value={editForm.deliveryDays}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, deliveryDays: e.target.value }))
                  }
                >
                  {DELIVERY_DAYS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Description</label>
                <textarea
                  className={textareaCls}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Features</label>
                <div className="flex flex-wrap gap-1.5">
                  {FEATURES.map((f) => (
                    <div
                      key={f}
                      onClick={() => toggleFeature(f, "edit")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-all border select-none ${editForm.features.includes(f) ? "bg-amber-400 text-white border-amber-500" : "bg-white text-amber-700/60 border-amber-700/15 hover:border-amber-400/50"}`}
                    >
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveEdit}
                disabled={editSaving}
                className={`flex-1 bg-linear-to-br from-amber-400 to-amber-600 text-white border-none py-2.5 rounded-xl font-['Cinzel',serif] text-[11px] font-bold tracking-widest uppercase cursor-pointer hover:-translate-y-0.5 transition-all shadow-[0_4px_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 ${editSaving ? "opacity-50" : ""}`}
              >
                {editSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : (
                  "✦ Save Changes"
                )}
              </button>
              <button
                onClick={() => setEditProduct(null)}
                className="px-5 py-2.5 rounded-xl border border-amber-700/15 text-amber-700/50 text-[13px] cursor-pointer hover:bg-amber-50 hover:text-amber-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 bg-linear-to-br from-amber-400 to-amber-600 text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl font-['Cinzel',serif] text-xs font-bold tracking-wide shadow-[0_8px_32px_rgba(245,158,11,0.4)] z-50 flex items-center gap-2.5">
          <span>✦</span> {toastMsg}
        </div>
      )}
    </div>
  );
}
