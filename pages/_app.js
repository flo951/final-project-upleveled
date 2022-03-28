import { css, Global } from '@emotion/react';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState();

  const refreshUserProfile = useCallback(async () => {
    const response = await fetch('/api/profile');
    const data = await response.json();

    if ('errors' in data) {
      console.log(data.errors);
      setUser(undefined);
      return;
    }

    setUser(data.user);
  }, []);

  useEffect(() => {
    refreshUserProfile().catch(() => {});
  }, [refreshUserProfile]);
  return (
    <>
      <Global
        styles={css`
          html,
          body {
            margin: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
              sans-serif;
          }
        `}
      />
      <Head>
        <meta charset="utf-8" />

        <link rel="manifest" href="/manifest.json" />
        <link
          rel="apple-touch-icon"
          href="%PUBLIC_URL%/images/icon-apple-touch.png"
        />
        <link rel="icon" href="images/favicon.svg" type="image/svg+xml" />
      </Head>
      <Layout userObject={user} refreshUserProfile={refreshUserProfile}>
        <Component {...pageProps} refreshUserProfile={refreshUserProfile} />
      </Layout>
    </>
  );
}

export default MyApp;
