import React from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";

export default function PublicLayout() {
  return (
    <>
      <PublicNavbar />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
