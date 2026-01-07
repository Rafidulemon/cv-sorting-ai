import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#12233E] bg-[#0A1628]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-2 px-4 py-6 text-xs text-[#4F627D] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p>All Right Reserves to Carriastic.</p>
        <Link
          href="https://carriasticapp.vercel.app/"
          className="text-[#38BDF8] transition hover:text-[#7DD3FC]"
          target="_blank"
          rel="noreferrer"
        >
          https://carriasticapp.vercel.app/
        </Link>
      </div>
    </footer>
  );
}
