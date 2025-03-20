import '../globals.css'; // Ensure the correct path to your globals.css file

export default function App({ Component, pageProps }: { Component: any; pageProps: any }) {
  return <Component {...pageProps} />;
}
