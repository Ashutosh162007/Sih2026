import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function AppShell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 bg-white">
            <Sidebar />
          </div>
          <button type="button" className="flex-1 bg-black/30" onClick={() => setOpen(false)} aria-label="Close menu" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 md:block">
          <button
            type="button"
            className="ml-3 rounded-xl border border-slate-200 p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="min-w-0 flex-1">
            <TopBar />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
