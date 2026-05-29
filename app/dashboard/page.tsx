"use client";

import { useEffect, useState } from "react";
import { useAuthStore, useExpenseStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import ExpenseList from "@/components/ExpenseList";
import AddExpenseForm from "@/components/AddExpenseForm";
import BudgetManager from "@/components/BudgetManager";
import { LogOut, Plus, TrendingDown } from "lucide-react";

export default function DashboardPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const { user, loading, checkAuth, logout } = useAuthStore();
  const { fetchExpenses, fetchBudgets } = useExpenseStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchBudgets();
    }
  }, [user, fetchExpenses, fetchBudgets]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth");
    } catch (err) {
      console.error("Logout redirection failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-400 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-sm font-medium tracking-wide">Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💰</div>
            <div>
              <h1 className="text-xl font-bold">ExpenseTracker</h1>
              <p className="text-xs text-slate-400">AI-powered expense management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowAddForm(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-md active:scale-95"
            >
              <Plus size={18} />
              Add Expense
            </button>
            <button 
              onClick={handleLogout} 
              className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 active:scale-95"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid Layout */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column Workspace: Spacious Macro Analytics & Financial Targets */}
          <div className="lg:col-span-2 space-y-6">
            <Dashboard />
            <BudgetManager />
          </div>

          {/* Right Column Workspace: Isolated Dedicated Transaction Ledger */}
          <div className="lg:col-span-1">
            <div className="card bg-slate-800/40 p-5 border border-slate-800 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-700/40 pb-3">
                <TrendingDown size={20} className="text-red-400" />
                <h2 className="text-lg font-bold text-white">Recent Expenses</h2>
              </div>
              <ExpenseList />
            </div>
          </div>

        </div>
      </main>

      {/* Centered Floating Add Expense Modal Overlay Container */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md relative">
            <AddExpenseForm onClose={() => setShowAddForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}