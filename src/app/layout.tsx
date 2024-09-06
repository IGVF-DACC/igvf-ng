// node_modules
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// components
import { NavigationSection } from "@/components/navigation";
// context
import { GlobalContextProvider } from "@/context/global";
// styles
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IGVF",
  description: "IGVF Data Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="md:container">
          <GlobalContextProvider>
            <div className="md:flex">
              <NavigationSection />
              <div className="min-w-0 shrink grow px-3 py-2 md:px-8">
                {children}
              </div>
            </div>
          </GlobalContextProvider>
        </div>
      </body>
    </html>
  );
}
