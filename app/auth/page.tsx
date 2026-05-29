"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle, user } = useAuthStore(); // Added loginWithGoogle
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              💰 ExpenseTracker
            </h1>
            <p className="text-slate-400 mt-2">AI-powered expense management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded">{error}</div>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Loading..." : isSignup ? "Sign Up" : "Sign In"}
            </button>
          </form>

          {/* Divider Line */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-800 px-2 text-slate-400">Or continue with</span></div>
          </div>

          {/* Google Button */}
          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-medium py-2 rounded-lg transition active:scale-95 text-sm"
          >
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.79 5.79 0 0 1 8.2 12.725a5.79 5.79 0 0 1 5.79-5.79c2.519 0 4.545 1.595 5.251 3.796l3.866-3.003C20.892 4.14 16.924 2 13.99 2 7.92 2 3 6.92 3 12.99s4.92 10.99 10.99 10.99c6.335 0 10.745-4.453 10.745-10.915 0-.741-.077-1.428-.222-2.065l-12.263-.715z"/>
            </svg>
            Continue with Google
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => !loading && setIsSignup(!isSignup)}
              className="text-blue-400 hover:text-blue-300 text-sm transition"
            >
              {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}