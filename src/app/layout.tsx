// app/layout.tsx
import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "./providers/ThemeProvider";
import { Toaster } from "sonner";
import NextNProgress from "./providers/loader";
import TopLoader from "./providers/loader";

export const metadata: Metadata = {
  title: "Musahibe.az",
  description: "Ən son xəbərlər burda",
  icons: [{ rel: "icon", url: "/logo.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="poppins-regular">
        <TRPCReactProvider>
           <NextNProgress/>
          <ThemeProvider>
            {children}
          </ThemeProvider>
          <Toaster richColors position="top-center" />
          
        </TRPCReactProvider>
        <TopLoader/>
      </body>
    </html>
  );
}