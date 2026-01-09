import { AlertTriangle, BadgeCheck, CreditCard, Download, FileText, Wallet } from "lucide-react";

const invoices = [
  { id: "INV-1842", tenant: "Acme Talent", amount: "$4,820", status: "Paid", due: "Feb 28", issued: "Feb 1" },
  { id: "INV-1839", tenant: "Northwind", amount: "$3,140", status: "Paid", due: "Feb 28", issued: "Feb 1" },
  { id: "INV-1832", tenant: "Lumina HR", amount: "$2,508", status: "Paid", due: "Feb 28", issued: "Feb 1" },
  { id: "INV-1826", tenant: "Nova Labs", amount: "$1,944", status: "Past Due", due: "Feb 15", issued: "Feb 1" },
];

const summaries = [
  { label: "Invoices (MTD)", value: "$14,412", icon: FileText },
  { label: "Collected", value: "$12,468", icon: Wallet },
  { label: "Past due", value: "$1,944", icon: AlertTriangle },
];

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Billing</p>
          <h1 className="text-2xl font-semibold text-white">Invoices</h1>
          <p className="text-sm text-slate-400">Plan billing, status, and exports for each tenant.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-primary-500/50 bg-primary-500/10 px-3 py-2 text-sm font-semibold text-primary-100 transition hover:bg-primary-500/15" type="button">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        {summaries.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">{item.label}</p>
                <p className="text-2xl font-semibold text-white">{item.value}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-primary-100 ring-1 ring-slate-700">
                <item.icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Invoice list</p>
            <h2 className="text-lg font-semibold text-white">Status by tenant</h2>
          </div>
          <CreditCard className="h-5 w-5 text-primary-200" />
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Invoice</th>
                <th className="px-4 py-3 text-left font-semibold">Tenant</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Issued</th>
                <th className="px-4 py-3 text-left font-semibold">Due</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-semibold text-white">{invoice.id}</td>
                  <td className="px-4 py-3 text-primary-100">{invoice.tenant}</td>
                  <td className="px-4 py-3">{invoice.amount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        invoice.status === "Paid"
                          ? "bg-success-500/15 text-success-100"
                          : "bg-amber-500/15 text-amber-100"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{invoice.issued}</td>
                  <td className="px-4 py-3 text-slate-300">{invoice.due}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <button className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-100" type="button">
                        View
                      </button>
                      <button className="rounded-lg border border-primary-500/50 bg-primary-500/10 px-2.5 py-1 text-primary-100" type="button">
                        Send receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-lg border border-amber-700/60 bg-amber-500/10 p-3 text-xs text-amber-100">
          Past-due invoices trigger payment retries and notify billing contacts.
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Automation</p>
              <h2 className="text-lg font-semibold text-white">Retries & webhooks</h2>
            </div>
            <BadgeCheck className="h-5 w-5 text-primary-200" />
          </div>
          <p className="mt-2 text-sm text-slate-300">Webhook delivery for invoice events (created, paid, past_due). Automatic retries with backoff.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Risk</p>
              <h2 className="text-lg font-semibold text-white">Disputes & refunds</h2>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-2 text-sm text-slate-300">Track disputes, manual reviews, and refund approvals. Log every action to audit.</p>
        </div>
      </section>
    </div>
  );
}
