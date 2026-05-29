"use client";

import { useState } from "react";
import { useExpenseStore } from "@/lib/store";
import { AlertTriangle, ShieldCheck, Wallet, Flame } from "lucide-react";

export default function BudgetManager() {
  const { expenses, budgets, addBudget, updateBudget } = useExpenseStore();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [limit, setLimit] = useState("");

  const categories = [
    "Total Budget", "Food & Dining", "Transportation", "Shopping", 
    "Entertainment", "Bills & Utilities", "Health & Fitness", 
    "Education", "Travel", "Personal Care", "Other"
  ];

  // 1. Filter expenses down strictly to the current calendar month
  const currentMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    const now = new Date();
    return (
      expDate.getMonth() === now.getMonth() &&
      expDate.getFullYear() === now.getFullYear()
    );
  });

  // 2. Process budget submission logic
  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !limit || parseFloat(limit) <= 0) return;

    const numericLimit = parseFloat(limit);
    // Check if a budget rule already exists for this selection
    const existingBudget = budgets.find((b) => b.category === selectedCategory);

    if (existingBudget) {
      await updateBudget(existingBudget.id, numericLimit);
    } else {
      await addBudget({ category: selectedCategory, monthly_limit: numericLimit });
    }

    setLimit("");
    setSelectedCategory("");
  };

  return (
    <div className="card bg-slate-800/40 p-5 border border-slate-800 rounded-2xl shadow-xl space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-700/40 pb-3">
        <Wallet size={20} className="text-blue-400" />
        <h2 className="text-lg font-bold text-white">Monthly Target Budgets</h2>
      </div>

      {/* Input Setup Form */}
      <form onSubmit={handleSaveBudget} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div className="sm:col-span-1">
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Target Scope</label>
          <select
            className="input py-1.5 text-xs bg-slate-900"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">Select scope...</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-1">
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Limit (₹)</label>
          <input
            type="number"
            className="input py-1.5 text-xs bg-slate-900"
            placeholder="e.g. 5000"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 rounded-lg transition active:scale-95 h-9">
          Set Target
        </button>
      </form>

      {/* Dynamic Progress & Warning Alert Display Window */}
      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
        {budgets.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No budget limits configured for this month yet.</p>
        ) : (
          budgets.map((budget) => {
            // Compute spent total matching this budget scope context
            const totalSpent = currentMonthExpenses
              .filter((exp) => budget.category === "Total Budget" ? true : exp.category === budget.category)
              .reduce((sum, exp) => sum + exp.amount, 0);

            const percentage = Math.min((totalSpent / budget.monthly_limit) * 100, 100);
            const isExceeded = totalSpent >= budget.monthly_limit;
            const isWarning = totalSpent >= budget.monthly_limit * 0.8 && !isExceeded;

            // Determine status look parameters
            let barColor = "bg-blue-500";
            let textColor = "text-slate-300";
            let statusIcon = <ShieldCheck size={14} className="text-green-400" />;
            let alertBox = null;

            if (isExceeded) {
              barColor = "bg-red-500 animate-pulse";
              textColor = "text-red-300 font-semibold";
              statusIcon = <Flame size={14} className="text-red-400 animate-bounce" />;
              alertBox = (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-2 rounded-lg mt-1 animate-fade-in">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span><strong>Critical Limit:</strong> Your spending for {budget.category} has blown past your allocated monthly target boundary!</span>
                </div>
              );
            } else if (isWarning) {
              barColor = "bg-yellow-500";
              textColor = "text-yellow-300 font-medium";
              statusIcon = <AlertTriangle size={14} className="text-yellow-400" />;
              alertBox = (
                <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[11px] p-2 rounded-lg mt-1">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span><strong>Approaching Cap:</strong> You have consumed over 80% of your allowance tracking pool for this scope.</span>
                </div>
              );
            }

            return (
              <div key={budget.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-white">
                    {statusIcon}
                    <span>{budget.category}</span>
                  </div>
                  <span className={textColor}>
                    ₹{totalSpent.toFixed(0)} / ₹{budget.monthly_limit.toFixed(0)} ({((totalSpent / budget.monthly_limit) * 100).toFixed(0)}%)
                  </span>
                </div>

                {/* Progress Visual Track */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                </div>

                {/* Conditional warning box append layer */}
                {alertBox}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}