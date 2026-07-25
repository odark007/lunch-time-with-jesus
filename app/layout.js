import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const SITE_URL = "https://lunchtimewithjesus.netlify.app";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lunch Time With Jesus",
    template: "%s | Lunch Time With Jesus"
  },
  description: "A daily audio word to carry you through the day.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192.png"
  },
  openGraph: {
    siteName: "Lunch Time With Jesus",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "Lunch Time With Jesus",
    description: "A daily audio word to carry you through the day.",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Lunch Time With Jesus",
    description: "A daily audio word to carry you through the day."
  }
};

export const viewport = {
  themeColor: "#1e5631",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
