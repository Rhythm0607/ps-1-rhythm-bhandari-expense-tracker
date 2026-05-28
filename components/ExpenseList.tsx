"use client";

import { useState } from "react";
import AddExpenseForm, { ExpenseData } from "./AddExpenseForm";
import { useExpenseStore } from "@/lib/store";
import { format } from "date-fns";
import { Trash2, Calendar, FilterX, Download, Pencil, Search } from "lucide-react"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExpenseList() {
  const { expenses, deleteExpense, loading } = useExpenseStore();
  const [editingExpense, setEditingExpense] = useState<ExpenseData | null>(null);
  
  // 1. Unified Control State hooks
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const categories = [
    "Food & Dining", "Transportation", "Shopping", "Entertainment",
    "Bills & Utilities", "Health & Fitness", "Education", "Travel",
    "Personal Care", "Other",
  ];

  const categoryColors: Record<string, string> = {
    "Food & Dining": "bg-orange-500/20 text-orange-300",
    Transportation: "bg-blue-500/20 text-blue-300",
    Shopping: "bg-pink-500/20 text-pink-300",
    Entertainment: "bg-purple-500/20 text-purple-300",
    "Bills & Utilities": "bg-red-500/20 text-red-300",
    "Health & Fitness": "bg-green-500/20 text-green-300",
    Education: "bg-indigo-500/20 text-indigo-300",
    Travel: "bg-cyan-500/20 text-cyan-300",
    "Personal Care": "bg-yellow-500/20 text-yellow-300",
    Other: "bg-slate-500/20 text-slate-300",
  };

  if (loading) {
    return <div className="text-center text-slate-400">Loading expenses...</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No expenses yet. Add one to get started!</p>
      </div>
    );
  }

  // 2. ADVANCED UNIFIED FILTER PIPELINE
  const filteredExpenses = expenses.filter((expense) => {
    // A. Chronological Boundary verification
    const expDate = new Date(expense.date);
    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date("2100-01-01");
    const matchesDate = expDate >= start && expDate <= end;

    // B. Case-insensitive String Text verification
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // C. Exact Structural Category verification
    const matchesCategory = selectedCategory ? expense.category === selectedCategory : true;

    // Row resolves true only if it survives all three validation layers
    return matchesDate && matchesSearch && matchesCategory;
  });

  const filteredTotal = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Expense Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    const dateText = (startDate && endDate) ? `From: ${startDate} To: ${endDate}` : "All Time";
    const categoryText = selectedCategory ? ` | Category: ${selectedCategory}` : "";
    const searchText = searchQuery ? ` | Search: "${searchQuery}"` : "";
    doc.text(`Period: ${dateText}${categoryText}${searchText} | Total: Rs. ${filteredTotal.toFixed(2)}`, 14, 30);

    const tableColumn = ["Date", "Description", "Category", "Amount (Rs)"];
    const tableRows = filteredExpenses.map(exp => [
      format(new Date(exp.date), "MMM dd, yyyy"),
      exp.description,
      exp.category,
      exp.amount.toFixed(2)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    doc.save(`ExpenseReport_Export.pdf`);
  };

  const handleClearAll = () => {
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setSelectedCategory("");
  };

  const isFilteringActive = startDate || endDate || searchQuery || selectedCategory;

  return (
    <>
      {/* Dynamic Advanced Control Center Box */}
      <div className="card mb-4 bg-slate-800/50 p-4 border border-slate-700 rounded-xl space-y-4">
        
        {/* Row 1: Text Search & Category Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by description..."
              className="input pl-9 py-1.5 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              className="input py-1.5 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Date Boundaries, Clear Action & Output Data Display */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-700/40">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              <input 
                type="date" 
                className="input py-1 px-2 text-xs max-w-[130px] bg-slate-800" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <span className="text-slate-500 text-xs">to</span>
            <div className="flex items-center gap-1.5">
              <input 
                type="date" 
                className="input py-1 px-2 text-xs max-w-[130px] bg-slate-800" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            {isFilteringActive && (
              <button 
                onClick={handleClearAll}
                className="text-slate-400 hover:text-red-400 transition ml-2 flex items-center gap-1 text-xs font-medium"
                title="Reset control panel filters"
              >
                <FilterX size={14} /> Reset
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Filtered Total</p>
              <p className="text-base font-bold text-white">₹{filteredTotal.toFixed(2)}</p>
            </div>
            
            <button 
              onClick={generatePDF}
              disabled={filteredExpenses.length === 0}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed h-9 shadow-md"
            >
              <Download size={13} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Expense Scroll Box Container Window */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pl-1 pr-2">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No transactions match your search parameters.</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div key={expense.id} className="card flex items-center justify-between p-4 hover:bg-slate-700/50 transition border border-slate-800 rounded-xl gap-4 animate-fade-in">
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${categoryColors[expense.category] || categoryColors.Other}`}>
                    {expense.category}
                  </span>
                  <span className="text-slate-400 text-xs whitespace-nowrap">{format(new Date(expense.date), "MMM dd, yyyy")}</span>
                </div>
                <p className="text-white font-medium text-sm truncate" title={expense.description}>
                  {expense.description}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span className="text-base font-bold text-green-400 mr-1 whitespace-nowrap">₹{expense.amount.toFixed(2)}</span>
                
                <button 
                  onClick={() => setEditingExpense(expense)}
                  className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                  title="Edit expense"
                >
                  <Pencil size={15} />
                </button>

                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                  title="Delete expense"
                >
                  <Trash2 size={15} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Edit Modal Context */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md relative">
            <AddExpenseForm 
              initialData={editingExpense} 
              onClose={() => setEditingExpense(null)} 
            />
          </div>
        </div>
      )}
    </>
  );
}