import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#DCE0E0] bg-[#F7F8FC]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-2 px-4 py-6 text-xs text-[#8A94A6] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p>All Right Reserves to Carriastic.</p>
        <Link
          href="https://carriasticapp.vercel.app/"
          className="text-[#3D64FF] transition hover:text-[#5C7CFF]"
          target="_blank"
          rel="noreferrer"
        >
          https://carriasticapp.vercel.app/
        </Link>
      </div>
    </footer>
  );
}
