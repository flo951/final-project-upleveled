import { GetServerSidePropsContext } from 'next';
import {
  Event,
  getAllEventsWhereIdMatches,
  getUserByValidSessionToken,
} from '../../util/database';
import { css } from '@emotion/react';
import Head from 'next/head';
import { useState } from 'react';
import { DeleteEventResponseBody } from '../api/event';
import Link from 'next/link';
import { eventListStyles, personStyles, spanStyles } from '../createevent';
import Image from 'next/image';
import { eventProfilePicStyles, removeButtonStyles } from './[eventId]';

const mainStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const borderEventListStyles = css`
  border: 2px solid black;
  border-radius: 8px;
  width: 348px;
  h3 {
    text-align: center;
  }
`;
const flexRowStyles = css`
  display: flex;
  align-items: flex-start;

  a {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
  }
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
      (await deleteResponse.json()) as DeleteEventResponseBody;

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
        <title>Event List from {props.user.username}</title>

        <meta
          name={`Event List from ${props.user.username}`}
          content="View Event List connected to user"
        />
      </Head>
      {errors}
      <main css={mainStyles}>
        {/* Event List */}
        <div css={borderEventListStyles}>
          <h3>
            {eventList.length === 0
              ? ' You have no events yet, click on the Link above to create an event'
              : `This are your events ${props.user.username}`}
          </h3>
          <div css={eventListStyles}>
            {eventList.map((event: Event) => {
              return (
                <div
                  data-test-id={`event-${event.id}`}
                  key={`This is ${event.eventname} witdh ${event.id}`}
                  css={flexRowStyles}
                >
                  <Link href={`/users/${event.id}`}>
                    <a>
                      <Image
                        css={eventProfilePicStyles}
                        src={
                          event.imageurl
                            ? event.imageurl
                            : '/images/maldives-1993704_640.jpg'
                        }
                        alt={`Profile Picture of ${event.eventname}`}
                        width={50}
                        height={50}
                      />
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
  };
}
