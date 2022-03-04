import { GetServerSidePropsContext } from 'next';
import { getUserByValidSessionToken } from '../../util/database';
import { css } from '@emotion/react';

const mainStyles = css`
  margin: 1rem 1rem;
`;

type Props = {
  user: { id: number; username: string };
};

export default function ProtectedUser(props: Props) {
  return (
    <main css={mainStyles}>
      <h1>you will only see this when you are logged in</h1>
      <div>user id is {props.user.id}</div>
      <div>user name is {props.user.username}</div>
    </main>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // 1. get a user from the cookie sessiontoken

  const token = context.req.cookies.sessionToken;

  const user = await getUserByValidSessionToken(token);
  if (user) {
    // 2. if there is a user, return undefined
    console.log(user);
    return {
      props: { user: user },
    };
  }

  return {
    redirect: {
      destination: '/login?returnTo=/users/protectedUser',
      permanent: false,
    },
  };
}
