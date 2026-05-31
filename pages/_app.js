import "../styles/globals.css";
import { createContext, useContext, useEffect, useState } from "react";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import Footer from "../components/Footer";
import OnboardingModal from "../components/OnboardingModal";

export const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
    // Register service worker for PWA offline support
    if ("serviceWorker" in navigator) {
      // Unregister all old service workers first, then register fresh
      navigator.serviceWorker.getRegistrations().then((regs) => {
        Promise.all(regs.map((r) => r.unregister())).then(() => {
          navigator.serviceWorker.register("/sw.js").catch(() => {});
        });
      });
    }
  }, []);



  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <SessionProvider session={pageProps.session}>
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Civilian" />
      </Head>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ flex: 1 }}>
          <Component {...pageProps} />
        </div>
        <Footer />
      </div>
      <OnboardingModal />
    </ThemeContext.Provider>
    </SessionProvider>
  );
}
