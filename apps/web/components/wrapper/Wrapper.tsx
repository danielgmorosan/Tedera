import React from "react";
import Sidebar from "../Sidebar";

export default function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh fixed inset-0 bg-gray-100">
      <Sidebar />
      <main
        className="flex-1 bg-white overflow-y-auto m-2 ml-0 rounded-xl"
        style={{
          boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
