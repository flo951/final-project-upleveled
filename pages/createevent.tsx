import { css } from '@emotion/react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import {
  Event,
  getAllEventsWhereIdMatches,
  getUserByValidSessionToken,
  getValidSessionByToken,
} from '../util/database';
import { CreateEventResponseBody } from './api/event';

const errorStyles = css`
  color: red;
  font-size: 24px;
`;
export const divGridListStyles = css`
  display: grid;
  grid-template-columns: 30% 30% 30%;
  grid-template-rows: auto;
  grid-gap: 8px;
  justify-items: end;
  align-items: center;
  list-style: none;
  margin: 12px;
  max-width: 342px;
`;
export const formStyles = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 12px;
  max-width: 342px;
`;

const mainContainerDivStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 12px;
`;

export const smallContainerDivStyles = css`
  h1 {
    font-size: 24px;
    margin: 12px;
  }
`;
export const spanStyles = css`
  font-size: 24px;
`;
export const inputSubmitStyles = css`
  background-color: #2a6592;
  padding: 4px;
  font-size: 24px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  min-width: 342px;
`;
export const nameInputStyles = css`
  font-size: 24px;
  max-width: 342px;
  border-radius: 4px;
  padding: 4px;
  :focus {
    transition: 0.3s ease-out;
  }
`;

export const personStyles = css`
  padding: 12px 0px;
`;

type Props = {
  eventsInDb: Event[];
  user?: { id: number; username: string };

  errors?: string;
};

type Errors = { message: string }[];

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

  // function handlePersonSelect(e) {
  //   const person: object = e.target.value;
  //   console.log(person);
  //   const addPersonList = [...peopleListCopy, { person }];
  //   setPeopleListCopy(addPersonList);
  //   console.log(addPersonList);
  // }

  return (
    <>
      <Head>
        <title>Events</title>
        <meta name="Create New Events" content="" />
      </Head>
      <div css={mainContainerDivStyles}>
        <div css={smallContainerDivStyles}>
          <h1>Create Event</h1>

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

              const createPersonResponseBody =
                (await createPersonResponse.json()) as CreateEventResponseBody;
              const createdEvents = [
                ...eventList,
                createPersonResponseBody.event,
              ];

              setEventList(createdEvents);
              setEventName('');
              if ('errors' in createPersonResponseBody) {
                setErrors(createPersonResponseBody.errors);
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
              value={eventName}
              onChange={(e) => setEventName(e.currentTarget.value)}
              required
            />

            <input
              css={inputSubmitStyles}
              data-test-id="complete-create-event"
              type="submit"
              value="Create"
            />
          </form>
        </div>
      </div>
      {eventList.map((event: Event) => {
        return (
          <div
            data-test-id={`product-${event.id}`}
            key={`this is ${event.eventname} witdh ${event.id}`}
          >
            <h2 css={spanStyles}>{event.eventname}</h2>
          </div>
        );
      })}
      {/* <div css={eventContainerStyles}>
        {props.eventsInDb.map((event: Event) => {
          return (
            <div
              data-test-id={`product-${event.id}`}
              key={`this is ${event.eventname} witdh ${event.id}`}
            >
              <h2 css={spanStyles}>{event.eventname}</h2>
              <select id="dropdown" onChange={handlePersonSelect}>
              <option key="template" value="">
                Select Person
              </option>
              {peopleList.map((person) => {
                return (
                  <option
                    key={`person-${person.name}-${person.id}`}
                    value={person.name}
                  >
                    {person.name}
                  </option>
                );
              })}
            </select>

              {peopleList.map((person: Person) => {
                const isDisabled = isEditPersonId !== person.id;
                return (
                  <div
                    data-test-id={`product-${person.id}`}
                    key={`this is ${person.name} witdh ${person.id}`}
                  >
                    <div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <span css={spanStyles}>{person.name}</span>
                        <label htmlFor="event-person-expense">€</label>
                        <input
                          value={personExpense}
                          type="number"
                          disabled={isDisabled}
                          onChange={(e) => {
                            setPersonExpense(parseInt(e.currentTarget.value));
                          }}
                        />
                        {isDisabled ? (
                          <button
                            onClick={() => {
                              setIsEditPersonId(person.id);
                            }}
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setIsEditPersonId(undefined);
                            }}
                          >
                            Save
                          </button>
                        )}
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        <button>Calculate</button>
      </div> */}
      <div css={errorStyles}>
        {errors !== undefined
          ? errors.map((error) => {
              return <div key={`error-${error.message}`}>{error.message}</div>;
            })
          : ''}
      </div>
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
