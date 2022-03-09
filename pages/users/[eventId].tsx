import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import {
  getUserById,
  getUserByValidSessionToken,
  User,
} from '../../util/database';

type Props = {
  user: User;
  errors: string;
};

export default function UserDetail(props: Props) {
  // if (!props.user) {
  //   return (
  //     <>
  //       <Head>
  //         <title>User not found</title>
  //         <meta name="description" content="User not found" />
  //       </Head>
  //       <h1>User not found or you are not allowed to see this page</h1>
  //     </>
  //   );
  // }
  if (props.errors) {
    return (
      <>
        <Head>
          <title>No Access</title>
          <meta
            name="description"
            content="You are not allowed to see this page"
          />
        </Head>
        <h1>You are not allowed to see this page</h1>
      </>
    );
  }
  return (
    <>
      <Head>
        <title>
          User #{props.user.id} {props.user.username}
        </title>

        <meta
          name={`User page from ${props.user.username}`}
          content="View single event by id"
        />
      </Head>

      <h1>Welcome {props.user.username}</h1>
    </>
  );
}
export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<{ event?: Event }>> {
  const userId = context.query.userId;
  console.log('this is context', context.query);
  const token = context.req.cookies.sessionToken;
  const user = await getUserByValidSessionToken(token);
  console.log(user);
  // if (!token) {
  //   return {
  //     props: {
  //       errors: 'You are not allowed to see this page',
  //     },
  //   };
  // }

  // if (user.id !== parseInt(userId)) {
  //   return {
  //     props: {
  //       errors: 'You are not allowed to see this page',
  //     },
  //   };
  // }

  if (!userId || Array.isArray(userId)) {
    return { props: {} };
  }

  const userById = await getUserById(parseInt(userId));
  console.log(userById);
  if (!userById) {
    context.res.statusCode = 404;
    return {
      // notFound: true, also works but generates a generic 404 page
      props: {},
    };
  }
  // const eventsInDb = await getAllEventsWhereIdMatches(user.id);
  // if (!eventsInDb) {
  //   return {
  //     props: {
  //       errors: 'You are not logged in',
  //     },
  //   };
  // }
  // console.log(eventsInDb);

  return {
    props: {
      // user: userById,
      // eventsInDb: eventsInDb,
    },
  };
}
