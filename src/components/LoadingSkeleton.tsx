import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  type?: "card" | "table" | "stat" | "page";
  count?: number;
}

const Pulse = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded-lg ${className || ""}`} />
);

export const StatSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Pulse className="h-4 w-24" />
        <Pulse className="h-8 w-16" />
        <Pulse className="h-3 w-20" />
      </div>
      <Pulse className="w-10 h-10 rounded-xl" />
    </div>
  </div>
);

export const MealCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="flex items-center gap-3 mb-4">
      <Pulse className="w-5 h-5 rounded-full" />
      <div className="space-y-1">
        <Pulse className="h-4 w-20" />
        <Pulse className="h-3 w-28" />
      </div>
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-2">
          <Pulse className="w-2 h-2 rounded-full mt-1.5" />
          <div className="space-y-1 flex-1">
            <Pulse className="h-4 w-3/4" />
            <Pulse className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="px-4 py-3 border-b border-border">
      <Pulse className="h-5 w-32" />
    </div>
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Pulse className="h-4 w-24" />
          <Pulse className="h-4 w-32" />
          <Pulse className="h-4 w-16" />
          <Pulse className="h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);

export const StudentCardSkeleton = () => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className="flex items-center gap-3 mb-3">
      <Pulse className="w-10 h-10 rounded-full" />
      <div className="space-y-1">
        <Pulse className="h-4 w-28" />
        <Pulse className="h-3 w-40" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-muted rounded-lg py-2 px-2">
          <Pulse className="h-4 w-12 mx-auto mb-1" />
          <Pulse className="h-3 w-8 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

export const PageSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    <Pulse className="h-8 w-48" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <StatSkeleton key={i} />
      ))}
    </div>
    <TableSkeleton />
  </motion.div>
);

export const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
      <span className="text-2xl">⚠️</span>
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">Something went wrong</h3>
    <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

export default PageSkeleton;
