import Header from "../components/navigations/MainHeader";
import Footer from "../components/navigations/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div>{children}</div>
      <Footer />
    </>
  );
}
