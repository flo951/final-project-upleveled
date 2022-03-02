import { css } from '@emotion/react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { getUserById, User } from '../../util/database';

type Props = {
  user?: User;
};

export default function UserDetail(props: Props) {
  if (!props.user) {
    return (
      <>
        <Head>
          <title>User not found</title>
          <meta name="description" content="User not found" />
        </Head>
        <h1>User not found</h1>
        Better luck next time
      </>
    );
  }
  return (
    <>
      <Head>
        <title>
          User #{props.user.id} {props.user.username}
        </title>

        <meta name="Single product page" content="View single product by id" />
      </Head>

      <h1>This is {props.user.username}</h1>
    </>
  );
}
export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<{ user?: User }>> {
  const userId = context.query.userId;

  if (!userId || Array.isArray(userId)) {
    return { props: {} };
  }

  const user = await getUserById(parseInt(userId));

  if (!user) {
    context.res.statusCode = 404;
    return {
      //notFound: true, also works but generates a generic 404 page
      props: {},
    };
  }

  return {
    props: {
      user: user,
    },
  };
}
