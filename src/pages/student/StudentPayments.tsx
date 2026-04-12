import { useStudentEnrollment, useStudentPayments } from "@/hooks/useStudentData";
import { PageSkeleton, ErrorDisplay } from "@/components/LoadingSkeleton";
import StatCard from "@/components/StatCard";
import { CreditCard, Wallet, CalendarDays, TrendingUp } from "lucide-react";

const StudentPayments = () => {
  const { data: enrollment, isLoading: enrollLoading } = useStudentEnrollment();
  const { data: payments, isLoading: payLoading, error } = useStudentPayments();

  if (enrollLoading || payLoading) return <PageSkeleton />;
  if (error) return <ErrorDisplay message="Failed to load payments" onRetry={() => window.location.reload()} />;

  const totalPaid = (payments || [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Payments</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CreditCard} label="Total Paid" value={`₹${totalPaid}`} variant="primary" />
        <StatCard icon={Wallet} label="Balance" value={`₹${enrollment?.balance || 0}`} variant="info" />
        <StatCard icon={CalendarDays} label="Days Left" value={enrollment?.remaining_days || 0} variant="warning" />
        <StatCard icon={TrendingUp} label="Plan" value={enrollment ? "Active" : "None"} variant="default" />
      </div>

      {/* Payment History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Method</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {(!payments || payments.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No payment records yet</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{p.date}</td>
                    <td className="px-4 py-3 text-foreground">{p.description}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.method}</td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">₹{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "paid" ? "bg-accent text-accent-foreground" :
                        p.status === "pending" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentPayments;
