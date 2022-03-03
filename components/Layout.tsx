import { css } from '@emotion/react';
import Head from 'next/head';

import Header from './Header';
type Props = {
  children: object;
};
export default function Layout(props: Props) {
  console.log(props);
  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header userObject={props.userObject} />

      <main>{props.children}</main>
    </div>
  );
}
