import { ArrowRight, CreditCard, DollarSign, Receipt, RefreshCw, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";

const payments = [
  { id: "PMT-4812", tenant: "Acme Talent", amount: "$4,820", method: "Visa •••• 4242", status: "Succeeded", time: "2h ago" },
  { id: "PMT-4809", tenant: "Northwind", amount: "$3,140", method: "ACH •••• 1042", status: "Succeeded", time: "4h ago" },
  { id: "PMT-4805", tenant: "Nova Labs", amount: "$1,944", method: "Visa •••• 2222", status: "Failed", time: "6h ago" },
  { id: "PMT-4803", tenant: "Lumina HR", amount: "$2,508", method: "Mastercard •••• 5511", status: "Succeeded", time: "1d ago" },
];

const credits = [
  { tenant: "Acme Talent", balance: "$620", lastAction: "Added $300 credits by Riley", time: "1d ago" },
  { tenant: "Northwind", balance: "$180", lastAction: "Auto top-up $200", time: "3d ago" },
  { tenant: "Nova Labs", balance: "$0", lastAction: "None", time: "—" },
];

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Billing</p>
          <h1 className="text-2xl font-semibold text-white">Payments & credits</h1>
          <p className="text-sm text-slate-400">Track payments, failures, credits, and refunds across tenants.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button className="inline-flex items-center gap-2 rounded-lg border border-primary-500/50 bg-primary-500/10 px-3 py-2 text-primary-100 transition hover:bg-primary-500/15" type="button">
            <DollarSign className="h-4 w-4" />
            Add credits
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 transition hover:bg-slate-800/80" type="button">
            <RefreshCw className="h-4 w-4" />
            Retry failures
          </button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Payments</p>
              <h2 className="text-lg font-semibold text-white">Recent activity</h2>
            </div>
            <CreditCard className="h-5 w-5 text-primary-200" />
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Payment</th>
                  <th className="px-4 py-3 text-left font-semibold">Tenant</th>
                  <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Method</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-semibold text-white">{payment.id}</td>
                    <td className="px-4 py-3 text-primary-100">{payment.tenant}</td>
                    <td className="px-4 py-3">{payment.amount}</td>
                    <td className="px-4 py-3 text-slate-300">{payment.method}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          payment.status === "Succeeded"
                            ? "bg-success-500/15 text-success-100"
                            : "bg-amber-500/15 text-amber-100"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{payment.time}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <button className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-100" type="button">
                          Receipt
                        </button>
                        <button className="rounded-lg border border-primary-500/50 bg-primary-500/10 px-2.5 py-1 text-primary-100" type="button">
                          Refund
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 rounded-lg border border-amber-700/60 bg-amber-500/10 p-3 text-xs text-amber-100">
            Payment failures auto-retry and notify billing contacts; refunds and credits must log audit entries.
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Credits</p>
              <h2 className="text-lg font-semibold text-white">Balances</h2>
            </div>
            <Wallet className="h-5 w-5 text-primary-200" />
          </div>
          <ul className="space-y-2 text-sm text-slate-200">
            {credits.map((credit) => (
              <li key={credit.tenant} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{credit.tenant}</span>
                  <span className="text-primary-100">{credit.balance}</span>
                </div>
                <p className="text-xs text-slate-400">{credit.lastAction}</p>
                <p className="text-[11px] text-slate-500">{credit.time}</p>
              </li>
            ))}
          </ul>
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-400">
            Credits apply before overage billing; keep balances positive for heavy upload days.
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Guardrails</p>
              <h2 className="text-lg font-semibold text-white">Refunds & credits</h2>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary-200" />
          </div>
          <p className="mt-2 text-sm text-slate-300">Only billing admins can issue refunds/credits. All actions log to audit with reason and IP.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Automation</p>
              <h2 className="text-lg font-semibold text-white">Payment retries</h2>
            </div>
            <RefreshCw className="h-5 w-5 text-primary-200" />
          </div>
          <p className="mt-2 text-sm text-slate-300">Automatic retries with backoff; send failure notifications to billing contacts and support.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Links</p>
              <h2 className="text-lg font-semibold text-white">Invoices</h2>
            </div>
            <Receipt className="h-5 w-5 text-primary-200" />
          </div>
          <p className="mt-2 text-sm text-slate-300">Cross-check payments with invoice history to reconcile collections.</p>
          <Link href="/admin/invoices" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary-100 hover:text-primary-50">
            Go to invoices
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
