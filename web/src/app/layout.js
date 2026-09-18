import { Space_Grotesk, Sora, JetBrains_Mono, Lora, Bebas_Neue, Caveat, DM_Sans } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const sora = Sora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["700"],
});

const dmSans = DM_Sans({
  variable: "--font-article",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "Builder Daily",
  description: "Your daily AI digest.",
  icons: {
    icon: [
      { url: '/favicon-rounded/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-rounded/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-rounded/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-rounded/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon-rounded/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/favicon-rounded/site.webmanifest',
};

import { unstable_cache } from 'next/cache';
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { BookmarkProvider } from "@/context/BookmarkContext";
import { supabase } from "@/lib/supabase";

const getCachedAnalytics = unstable_cache(
  async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'custom_analytics_script')
        .single();
      return data?.value || '';
    } catch (e) {
      return '';
    }
  },
  ['custom_analytics_script'],
  { revalidate: 600 }
);

export default async function RootLayout({ children }) {
  let analyticsScript = '';
  try {
    analyticsScript = await getCachedAnalytics();
  } catch (e) {
    // Fallback safe
  }

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${sora.variable} ${jetbrainsMono.variable} ${lora.variable} ${bebasNeue.variable} ${caveat.variable} ${dmSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {analyticsScript && (
          <div dangerouslySetInnerHTML={{ __html: analyticsScript }} style={{ display: 'none' }} />
        )}
        <ThemeProvider>
          <AuthProvider>
            <SiteSettingsProvider>
              <BookmarkProvider>
                {children}
              </BookmarkProvider>
            </SiteSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

