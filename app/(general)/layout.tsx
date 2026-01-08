import StickyHeader from "../components/navigations/StickyHeader";
import Footer from "../components/navigations/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <StickyHeader />
      <div>{children}</div>
      <Footer />
    </>
  );
}
