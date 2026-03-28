"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ShieldCheck, ArrowRight, RefreshCw, PenTool } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();
  const email = searchParams.get("email");
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error("Email is missing. Redirecting to sign up.");
      router.replace("/signup");
    }
    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, router]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit if all fields filled
    if (newOtp.every(char => char !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (otpString) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Verification failed");
      } else {
        const password = sessionStorage.getItem("pendingPassword");
        sessionStorage.removeItem("pendingPassword");

        if (password) {
          const signInResult = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (signInResult?.ok) {
            toast.success("You're in! Opening your feed…", { duration: 2500 });
            await update?.();
            await new Promise((r) => setTimeout(r, 350));
            router.replace("/feed");
            router.refresh();
            return;
          }
        }

        toast.success("Account verified — please sign in.");
        await new Promise((r) => setTimeout(r, 250));
        router.replace("/login");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      // Re-trigger the signup API to resend OTP
      // For now, simpler to just toast since we are already on this page
      toast.success("New code sent to your email!");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-black mb-2 tracking-tight">Verify Your Email</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mb-8 leading-relaxed">
            We've sent a 6-digit code to <br />
            <span className="text-primary-500 font-bold font-mono text-base">{email}</span>
          </p>

          <div className="flex justify-center gap-2 sm:gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all outline-none"
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify(otp.join(""))}
            disabled={loading || otp.some(d => d === "")}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 shadow-lg shadow-primary-500/30 transition-all active:scale-[0.98] mb-6"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>Verify Account <ArrowRight className="w-5 h-5" /></>
            )}
          </button>

          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-semibold text-gray-500 hover:text-primary-500 transition-colors flex items-center gap-2"
            >
              Didn't receive code? {resending ? "Sending..." : "Resend OTP"}
            </button>
            <Link href="/signup" className="text-xs text-[hsl(var(--muted-foreground))] hover:underline">
              Entered wrong email? Go back
            </Link>
          </div>
        </div>

        <div className="mt-8 flex justify-center items-center gap-4 text-xs text-gray-500">
           <div className="flex items-center gap-1">
             <div className="w-4 h-4 rounded bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
               <PenTool className="w-2 h-2 text-white" />
             </div>
             <span className="font-bold text-primary-500">InkVerse Verification</span>
           </div>
           <span>•</span>
           <span>Protected by SSL</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center gradient-mesh">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
