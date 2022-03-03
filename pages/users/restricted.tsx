import { GetServerSidePropsContext } from 'next';
import {
  getUserByValidSessionToken,
  getValidSessionByToken,
  User,
} from '../../util/database';
import { css } from '@emotion/react';

const mainStyles = css`
  margin: 1rem 1rem;
`;

// tells typescript that props can have user and or error, its called a union in ts
type Props =
  | {
      user: User;
    }
  | {
      error: string;
    };

export default function RestrictedPage(props: Props) {
  if ('error' in props) {
    return (
      <main css={mainStyles}>
        <p>{props.error}</p>
      </main>
    );
  }

  return (
    <main css={mainStyles}>
      <h1>you will only see this when you are logged in</h1>
    </main>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const sessionToken = context.req.cookies.sessionToken;
  const session = await getValidSessionByToken(sessionToken);

  if (!session) {
    return {
      props: {
        error: 'You are not allowed to see this page',
      },
    };
  }
  const user = await getUserByValidSessionToken(sessionToken);
  return {
    props: {
      user: user,
    },
  };
}
