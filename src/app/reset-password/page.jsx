"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token || !email) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Invalid Link</h2>
        <p className="text-gray-400 text-sm">
          This password reset link is malformed or invalid. If you requested a reset, please click the exact link from your email.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Failed to reset password");
      } else {
        toast.success("Password updated successfully!");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (e) {
      toast.error("Internal connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-white">Reset Password</h1>
        <p className="text-sm text-gray-400 mt-2">Enter a secure new password for <br/><span className="text-primary-400 font-bold">{email}</span></p>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
        <input 
          type="password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 h-12 rounded-xl bg-[#020617] border border-gray-800 text-sm text-white focus:outline-none focus:border-primary-500/40" 
          placeholder="••••••••"
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="w-full h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-primary-600/20 disabled:opacity-50 transition-all"
      >
        {loading ? "Resetting..." : "Confirm Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md p-8 bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
        <Suspense fallback={<div className="text-center text-gray-500 animate-pulse">Loading secure connection...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
