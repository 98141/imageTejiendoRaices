import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "./public/PublicLayout";
import CatalogPage from "./public/CatalogPage";

import AdminLoginPage from "./admin/AdminLoginPage";
import AdminLayout from "./admin/AdminLayout";
import AdminCategoriesPage from "./admin/AdminCategoriesPage";
import AdminSubcategoriesPage from "./admin/AdminSubcategoriesPage";
import AdminDesignsPage from "./admin/AdminDesignsPage";
import AdminOrdersPage from "./admin/AdminOrdersPage";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Público */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/c/:categorySlug" element={<CatalogPage />} />
          <Route
            path="/c/:categorySlug/:subcategorySlug"
            element={<CatalogPage />}
          />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/categories" replace />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="subcategories" element={<AdminSubcategoriesPage />} />
          <Route path="designs" element={<AdminDesignsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
