import Head from 'next/head';
import { User } from '../util/database';

import Header from './Header';
type Props = {
  children: object;
  userObject?: User;
};
export default function Layout(props: Props) {
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
