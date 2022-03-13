import { GetServerSidePropsContext } from 'next';
import {
  Event,
  getAllEventsWhereIdMatches,
  getUserByValidSessionToken,
} from '../../util/database';
import { css } from '@emotion/react';
import Head from 'next/head';
import { useState } from 'react';

import { CreateEventResponseBody } from '../api/event';

import Link from 'next/link';
import { eventListStyles, personStyles, spanStyles } from '../createevent';

const mainStyles = css`
  margin: 1rem 1rem;
`;
const flexRowStyles = css`
  display: flex;
`;
const removeButtonStyles = css`
  color: red;
  border: none;
  background-color: white;
  font-size: 18px;
  cursor: pointer;
`;

type Props = {
  user: { id: number; username: string };
  eventsInDb: Event[];

  errors: string;
};
type Errors = { message: string }[];
export default function ProtectedUser(props: Props) {
  const [errors, setErrors] = useState<Errors | undefined>([]);
  const [eventList, setEventList] = useState<Event[]>(props.eventsInDb);

  // function to delete created events
  async function deleteEvent(id: number) {
    const deleteResponse = await fetch(`/api/event`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: id,
        user: props.user,
      }),
    });
    const deleteEventResponseBody =
      (await deleteResponse.json()) as CreateEventResponseBody;

    if ('errors' in deleteEventResponseBody) {
      setErrors(deleteEventResponseBody.errors);
      return;
    }

    const newEventList = eventList.filter((event) => {
      return deleteEventResponseBody.event.id !== event.id;
    });

    setEventList(newEventList);
  }
  if ('errors' in props) {
    return (
      <main>
        <p>{props.errors}</p>
      </main>
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
          content="View single product by id"
        />
      </Head>
      {errors}
      <main css={mainStyles}>
        {/* Event List */}
        <h3>Welcome {props.user.username}, this are your events</h3>
        <div css={eventListStyles}>
          {eventList.map((event: Event) => {
            return (
              <div
                data-test-id={`event-${event.id}`}
                key={`this is ${event.eventname} witdh ${event.id}`}
                css={flexRowStyles}
              >
                <Link href={`/users/${event.id}`}>
                  <a>
                    <div css={personStyles}>
                      <span css={spanStyles}>{event.eventname}</span>
                    </div>
                  </a>
                </Link>
                <button
                  css={removeButtonStyles}
                  onClick={() => {
                    deleteEvent(event.id).catch(() => {});
                  }}
                >
                  X
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // 1. get a user from the cookie sessiontoken

  const token = context.req.cookies.sessionToken;

  const user = await getUserByValidSessionToken(token);

  if (user === undefined) {
    return {
      props: {
        errors: 'You are not logged in',
      },
    };
  }

  const eventsInDb = await getAllEventsWhereIdMatches(user.id);

  return {
    props: {
      user: user,
      eventsInDb: eventsInDb,
    },
    // redirect: {
    //   destination: '/login?returnTo=/users/protectedUser',
    //   permanent: false,
    // },
  };
}
