// node_modules
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// components
import { DropdownPortalRoot } from "@/components/dropdown";
import { NavigationSection } from "@/components/navigation";
// context
import { GlobalContextProvider } from "@/context/global";
import { SessionContextProvider } from "@/context/session";
// styles
import "./globals.css";
import { AuthenticationProvider } from "@/context/authentication";

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
          <AuthenticationProvider>
            <GlobalContextProvider>
              <SessionContextProvider>
                <div className="md:flex">
                  <NavigationSection />
                  <div className="min-w-0 shrink grow px-3 py-2 md:px-8">
                    {children}
                  </div>
                </div>
              </SessionContextProvider>
            </GlobalContextProvider>
          </AuthenticationProvider>
        </div>
        <DropdownPortalRoot />
      </body>
    </html>
  );
}
