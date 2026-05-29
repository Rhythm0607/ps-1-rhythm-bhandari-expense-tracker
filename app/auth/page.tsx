"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"; // Imported eye icons here

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 1. Password visibility state
  const [view, setView] = useState<"signin" | "signup" | "forgot">("signin");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle, sendPasswordReset, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (view === "signup") {
        await signup(email, password);
        router.push("/dashboard");
      } else if (view === "signin") {
        await login(email, password);
        router.push("/dashboard");
      } else if (view === "forgot") {
        await sendPasswordReset(email);
        setSuccessMessage("A secure password reset link has been sent to your email inbox.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication processing failure");
    } finally {
      setLoading(false);
    }
  };

  // Automatically reset password text visibility whenever changing between signin/signup/forgot views
  const handleViewChange = (newView: "signin" | "signup" | "forgot") => {
    setError("");
    setSuccessMessage("");
    setShowPassword(false);
    setView(newView);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100">
      <div className="w-full max-w-md">
        <div className="card bg-slate-800/40 p-6 border border-slate-800 rounded-2xl shadow-xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              💰 ExpenseTracker
            </h1>
            <p className="text-slate-400 mt-2">
              {view === "forgot" ? "Reset your account password" : "AI-powered expense management"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {view !== "forgot" && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => handleViewChange("forgot")}
                    className="text-xs text-blue-400 hover:text-blue-300 transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                
                {/* 2. Absolute positioning wrapper box */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} // Dynamic input masking type change
                    className="input pr-10" // Extra right padding to accommodate toggle button positioning
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={view !== "forgot"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}
            {successMessage && <div className="text-green-400 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20">{successMessage}</div>}

            <button type="submit" className="btn-primary w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg font-medium transition" disabled={loading}>
              {loading ? "Processing..." : view === "signup" ? "Create Account" : view === "signin" ? "Sign In" : "Send Recovery Link"}
            </button>
          </form>

          {view !== "forgot" && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700/60"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-800 px-3 text-slate-400">Or continue with</span></div>
              </div>

              <button 
                type="button" 
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-medium py-2 rounded-lg transition text-sm shadow-md"
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.79 5.79 0 0 1 8.2 12.725a5.79 5.79 0 0 1 5.79-5.79c2.519 0 4.545 1.595 5.251 3.796l3.866-3.003C20.892 4.14 16.924 2 13.99 2 7.92 2 3 6.92 3 12.99s4.92 10.99 10.99 10.99c6.335 0 10.745-4.453 10.745-10.915 0-.741-.077-1.428-.222-2.065l-12.263-.715z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          <div className="text-center text-sm">
            {view === "forgot" ? (
              <button
                type="button"
                onClick={() => handleViewChange("signin")}
                className="text-blue-400 hover:text-blue-300 transition"
              >
                ← Back to Sign In
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleViewChange(view === "signin" ? "signup" : "signin")}
                className="text-blue-400 hover:text-blue-300 transition"
              >
                {view === "signin" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}