import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sistema Ganadero",
  description: "Sistema de Gestión Ganadera",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var dark = localStorage.getItem('darkMode');
                if (dark === 'true') document.documentElement.classList.add('dark');
                var accent = localStorage.getItem('accentColor');
                if (accent && accent !== 'blue') document.documentElement.classList.add('theme-' + accent);
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
