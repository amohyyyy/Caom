
import '../styles/globals.css';
import Head from 'next/head';
import { AuthProvider } from '../components/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>منصة التعليم</title>
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
