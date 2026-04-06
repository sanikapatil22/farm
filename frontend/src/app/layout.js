import { Montserrat, Playfair_Display } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import I18nProvider from "@/components/common/I18nProvider";
import ZapierChatbot from "@/components/common/ZapierChatbot";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: "FarmChain - Blockchain Supply Chain Tracker",
  description:
    "Track food from farm to plate using blockchain technology. Transparent, tamper-proof tracking ensuring authenticity and building trust.",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfairDisplay.variable}`}>
      <body className="antialiased font-sans">
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <ZapierChatbot />
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
