import { GetServerSidePropsContext } from 'next';
import { getUserById, getValidSessionByToken } from '../../util/database';
import { css } from '@emotion/react';

const mainStyles = css`
  margin: 1rem 1rem;
`;

export default function ProtectedUser(props) {
  return (
    <>
      <main css={mainStyles}>
        <h1>you will only see this when you are logged in</h1>
        <div>user id is {props.user.id}</div>
        <div>user name is {props.user.username}</div>
      </main>
    </>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // 1. check if there is a token and is valid from the cookie

  const token = context.req.cookies.sessionToken;
  // 2. if its valid redirect otherwise render the page
  if (token) {
    const session = await getValidSessionByToken(token);
    if (session) {
      const user = await getUserById(session.userId);
      return {
        props: { user: user },
      };
    }
  }
  return {
    redirect: {
      destination: '/login?returnTo=/users/protectedUser',
      permanent: false,
    },
  };
}
