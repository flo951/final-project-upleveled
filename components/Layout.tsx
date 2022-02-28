import { css } from '@emotion/react';
import Head from 'next/head';

import Header from './Header';
type Props = {
  children: object;
};
export default function Layout(props: Props) {
  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>{props.children}</main>
    </div>
  );
}
