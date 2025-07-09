import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import ReduxProvider from "@/store/reduxProvider";
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from "@/components/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EchoProof - Decentralized Communication Platform",
  description: "Secure, decentralized real-time communication platform"
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <ThirdwebProvider>
            {/* <AuthGuard>
              {children}
              <Toaster />
            </AuthGuard> */}
            {children}
            <Toaster />
          </ThirdwebProvider>
        </ReduxProvider>
      </body>
    </html >
  );
}
