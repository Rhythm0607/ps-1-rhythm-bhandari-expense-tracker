"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      // Success! Send them directly to their fresh dashboard panel
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to update password. Link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100">
      <div className="w-full max-w-md">
        <div className="card bg-slate-800/40 p-6 border border-slate-800 rounded-2xl shadow-xl space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Setup New Password</h1>
            <p className="text-slate-400 text-sm mt-1">Type your new secure login credentials below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">New Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Confirm New Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

            <button 
              type="submit" 
              className="btn-primary w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg font-medium transition shadow-md"
              disabled={loading}
            >
              {loading ? "Updating Password..." : "Update Password & Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}