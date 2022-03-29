import Head from 'next/head';
import { User } from '../util/database';
import Header from './Header';
type Props = {
  children: object;
  userObject?: User;
};
export default function Layout(props: Props) {
  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/icon-apple-touch.png" />
        <link rel="icon" href="images/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="images/icon-192.png" type="image/svg+xml" />
      </Head>
      <Header userObject={props.userObject} />

      <main>{props.children}</main>
    </>
  );
}
