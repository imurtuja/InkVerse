import { cn } from "@/lib/utils";

export default function FancyButton({ children, className, ...props }) {
  return (
    <button
      {...props}
      className={cn(
        "group relative overflow-hidden outline-none duration-300",
        "px-4 md:px-5 py-2 font-semibold text-[13px] md:text-[14px]",
        "rounded-xl md:rounded-lg flex items-center justify-center", 
        "bg-primary-600 dark:bg-primary-500",
        "text-white",
        "border border-b-[3px] border-primary-500 dark:border-primary-400",
        "hover:brightness-110 hover:border-t-[3px] hover:border-b",
        "active:opacity-75",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <span className="absolute -top-[150%] left-0 inline-flex w-80 h-[3px] rounded-md opacity-20 dark:opacity-30 group-hover:top-[150%] duration-500 bg-white shadow-[0_0_8px_4px_rgba(255,255,255,0.4)]" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
