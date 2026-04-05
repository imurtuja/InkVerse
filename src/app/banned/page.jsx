"use client";

import { getSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldX, Mail, LogOut, Loader2, Send, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function BannedPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [pageStatus, setPageStatus] = useState("loading"); // loading | ready
  const [appealMessage, setAppealMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAppeal, setActiveAppeal] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    (async () => {
      try {
        const s = await getSession();
        setSession(s);

        // Security check: If not banned, send home immediately
        if (s && !s.user?.isBanned) {
          router.replace("/feed");
          return;
        }

        if (s?.user) {
          const res = await fetch("/api/appeal");
          if (res.ok) {
            const data = await res.json();
            if (data.appeals?.length > 0) {
              setActiveAppeal(data.appeals[0]);
            }
          }
        }
      } catch {
        // silently fail
      } finally {
        setPageStatus("ready");
      }
    })();
  }, [router]);

  if (pageStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  // Final fallback if session check failed or user is not banned
  if (!session?.user || !session.user.isBanned) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center flex-col gap-6 text-white p-6 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Access Granted</h2>
          <p className="text-gray-400 text-sm">You are not restricted. Redirecting to platform...</p>
        </div>
        <button 
          onClick={() => router.push("/feed")}
          className="flex items-center gap-2 px-6 h-11 bg-white text-black rounded-xl text-sm font-black hover:bg-gray-200 transition-all active:scale-95"
        >
          Enter Platform <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const submitAppeal = async (e) => {
    e.preventDefault();
    if (!appealMessage.trim()) return toast.error("Please enter an appeal message");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: appealMessage })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      const data = await res.json();

      toast.success("Appeal submitted securely.");
      setActiveAppeal(data.appeal);
      setAppealMessage("");
    } catch (e) {
      toast.error(e.message || "Failed to submit appeal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reason = session?.user?.banReason || "Terms of Service Violation";
  const expiresAt = session?.user?.banExpiresAt ? new Date(session.user.banExpiresAt) : null;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0B1120] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Visual Header */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-inner shrink-0">
          <ShieldX className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-black text-white tracking-tight mb-2">Account Restricted</h1>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Your access to the platform has been temporarily or permanently restricted due to violations of our community guidelines.
        </p>

        {/* Ban Intel Block */}
        <div className="bg-[#020617] rounded-2xl border border-white/5 p-5 mb-6 space-y-4">
           <div>
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Stated Reason</span>
             <p className="text-sm text-gray-300 font-bold leading-snug">{reason}</p>
           </div>
           {expiresAt && (
             <div>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Restriction Expiry</span>
               <p className="text-sm text-red-400 font-bold">{expiresAt.toLocaleString()}</p>
             </div>
           )}
        </div>

        {/* Dynamic State UI */}
        {activeAppeal && activeAppeal.status === "pending" ? (
          <div className="flex flex-col items-center justify-center p-6 border border-amber-500/20 bg-amber-500/5 rounded-2xl border-dashed mt-auto">
            <Mail className="w-8 h-8 text-amber-500/50 mb-3" />
            <h3 className="text-amber-500 font-bold text-sm">Appeal Under Review</h3>
            <p className="text-xs text-amber-500/70 text-center mt-2 font-medium">Your request is currently being processed by the administrative team. You will be notified of any structural changes.</p>
          </div>
        ) : activeAppeal && activeAppeal.status === "rejected" ? (
          <div className="flex flex-col items-center justify-center p-6 border border-red-500/20 bg-red-500/10 rounded-2xl mt-auto">
            <ShieldX className="w-8 h-8 text-red-500 mb-3" />
            <h3 className="text-red-500 font-bold text-sm mb-2">Appeal Rejected</h3>
            <p className="text-xs text-red-400/80 text-center font-medium leading-relaxed mb-4">The administrative team has reviewed your appeal and decided to sustain the restriction.</p>
            {activeAppeal.adminResponse && (
               <div className="w-full bg-[#020617] rounded-xl p-4 border border-white/5">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Admin Note</span>
                 <p className="text-xs text-gray-300 italic">"{activeAppeal.adminResponse}"</p>
               </div>
            )}
          </div>
        ) : (
          <form onSubmit={submitAppeal} className="flex flex-col gap-3 mt-auto">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Submit Appeal Request</label>
             <textarea 
               value={appealMessage} 
               onChange={e => setAppealMessage(e.target.value)}
               placeholder="Explain why you believe this restriction was a mistake..."
               className="w-full p-4 h-32 rounded-2xl bg-[#020617] border border-white/10 text-sm text-white resize-none outline-none focus:border-primary-500/50 transition-colors"
             />
             <button disabled={isSubmitting} type="submit" className="h-12 w-full rounded-xl bg-white text-black font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50 mt-2">
               {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
               Transmit Appeal
             </button>
          </form>
        )}

      </div>

      <button onClick={() => signOut({ callbackUrl: "/login" })} className="mt-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
         <LogOut className="w-4 h-4" /> Terminate Session
      </button>
    </div>
  );
}
