import { css } from '@emotion/react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import {
  Event,
  getAllEventsWhereIdMatches,
  getUserByValidSessionToken,
  getValidSessionByToken,
} from '../util/database';
import { CreateEventResponseBody, DeleteEventResponseBody } from './api/event';

const errorStyles = css`
  color: red;
  font-size: 20px;
`;
export const divPersonListStyles = css`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 12px auto;
`;
export const formStyles = css`
  display: flex;
  width: 300px;
  flex-direction: column;
  gap: 12px;
  margin: 12px;
`;

const mainContainerDivStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid black;
  border-radius: 8px;
  margin: 0 auto;
  width: 348px;
`;

export const smallContainerDivStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;

  h1 {
    font-size: 20px;
  }
`;
export const spanStyles = css`
  font-size: 20px;
  color: black;
`;
export const inputSubmitStyles = css`
  background-color: #2a6592;
  padding: 4px;
  font-size: 20px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
`;
export const nameInputStyles = css`
  font-size: 20px;

  border-radius: 4px;
  padding: 4px;
  :focus {
    transition: 0.3s ease-out;
  }
`;

export const personStyles = css`
  display: flex;
  padding: 4px;
`;
export const eventListStyles = css`
  margin: 12px;
  display: flex;
  justify-content: flex-start;

  gap: 12px;
  flex-wrap: wrap;
  a {
    color: black;
  }
`;
const removeButtonStyles = css`
  color: red;
  border: none;
  background-color: white;
  font-size: 20px;
  cursor: pointer;
`;
type Props = {
  eventsInDb: Event[];
  user?: { id: number; username: string };

  errors?: string;
};

export type Errors = { message: string }[];

export default function CreateEvent(props: Props) {
  const [eventName, setEventName] = useState('');
  const [eventList, setEventList] = useState<Event[]>(props.eventsInDb);

  const [errors, setErrors] = useState<Errors | undefined>([]);

  if ('errors' in props) {
    return (
      <main>
        <p>{props.errors}</p>
      </main>
    );
  }
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

  return (
    <>
      <Head>
        <title>Events</title>
        <meta name="Create New Events" content="" />
      </Head>
      <main css={mainContainerDivStyles}>
        <div css={smallContainerDivStyles}>
          <h1>Create a new Event</h1>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const createPersonResponse = await fetch('/api/event', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  eventname: eventName,
                  user: props.user,
                }),
              });

              const createEventResponseBody =
                (await createPersonResponse.json()) as CreateEventResponseBody;

              if ('event' in createEventResponseBody) {
                const createdEvents: Event[] = [
                  ...eventList,
                  createEventResponseBody.event,
                ];

                setEventList(createdEvents);
                setEventName('');
              }

              if ('errors' in createEventResponseBody) {
                setErrors(createEventResponseBody.errors);
                return;
              }
            }}
            css={formStyles}
          >
            <label htmlFor="event-name">
              <span css={spanStyles}>Event Name</span>
            </label>
            <input
              css={nameInputStyles}
              data-test-id="create-event"
              placeholder="Event Name"
              id="event-name"
              value={eventName}
              onChange={(e) => setEventName(e.currentTarget.value)}
              required
            />

            <input
              css={inputSubmitStyles}
              data-test-id="complete-create-event"
              name="submit"
              type="submit"
              value="Create"
            />
          </form>
        </div>
        {eventList.length === 0 ? (
          ''
        ) : (
          <span css={spanStyles}>Click on your event to edit it</span>
        )}
        <div css={eventListStyles}>
          {eventList.map((event: Event) => {
            return (
              <div
                data-test-id={`event-${event.id}`}
                key={`this is ${event.eventname} witdh ${event.id}`}
              >
                <Link href={`/users/${event.id}`}>
                  <a>
                    <span css={spanStyles}>{event.eventname}</span>
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

        <div css={errorStyles}>
          {errors !== undefined
            ? errors.map((error) => {
                return (
                  <div key={`error-${error.message}`}>{error.message}</div>
                );
              })
            : ''}
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Redirect from HTTP to HTTPS on Heroku
  if (
    context.req.headers.host &&
    context.req.headers['x-forwarded-proto'] &&
    context.req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return {
      redirect: {
        destination: `https://${context.req.headers.host}/register`,
        permanent: true,
      },
    };
  }
  const sessionToken = context.req.cookies.sessionToken;
  const session = await getValidSessionByToken(sessionToken);
  if (!session) {
    return {
      props: {
        errors: 'You are not allowed to see this page, please login',
      },
    };
  }
  const user = await getUserByValidSessionToken(sessionToken);

  if (!user) {
    return {
      props: {
        errors: 'You are not logged in',
      },
    };
  }

  const eventsInDb = await getAllEventsWhereIdMatches(user.id);

  if (!eventsInDb) {
    return {
      props: {
        errors: 'You are not logged in',
      },
    };
  }

  return {
    props: {
      eventsInDb: eventsInDb,
      user: user,
    },
  };
}
