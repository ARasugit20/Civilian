import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <title>Civilian — Your voice. Your city. Amplified by AI.</title>
        <meta
          name="description"
          content="Describe a local issue in any language. Civilian finds the right official, drafts a formal letter citing real ordinances, and helps your neighbors echo it into action."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Civilian — Civic engagement amplified by AI" />
        <meta
          property="og:description"
          content="Turn everyday frustration into formal government action. Community feed, echoes, and AI-powered letters."
        />
        <meta property="og:site_name" content="Civilian" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Civilian — Your city. Your voice." />
        <meta
          name="twitter:description"
          content="AI-powered civic letters, community echoes, and transparent issue tracking."
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}