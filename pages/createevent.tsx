import { css } from '@emotion/react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';

import { useState } from 'react';
import {
  Event,
  getAllEventsWhereIdMatches,
  getAllPeopleWhereIdMatches,
  getUserByValidSessionToken,
  getValidSessionByToken,
  Person,
} from '../util/database';
import { CreatePersonResponseBody } from './api/person';

const errorStyles = css`
  color: red;
  font-size: 24px;
`;
const divGridListStyles = css`
  display: grid;
  grid-template-columns: 30% 30% 30%;
  grid-template-rows: 30% 30% 30%;
  grid-gap: 8px;
  list-style: none;
  margin: 12px;
  max-width: 342px;
`;
const formStyles = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 12px;
  max-width: 342px;
`;

const mainContainerDivStyles = css`
  display: flex;
  flex-direction: column;
  margin: 12px;
`;
const smallContainerDivStyles = css`
  h1 {
    font-size: 24px;
    margin: 12px;
  }
`;
const spanStyles = css`
  font-size: 24px;
`;
const inputSubmitStyles = css`
  background-color: #2a6592;
  padding: 8px 8px;
  font-size: 24px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
`;
const nameInputStyles = css`
  padding: 8px 8px;
  font-size: 24px;

  border-radius: 4px;
  :focus {
    transition: 0.3s ease-out;
  }
`;
const removeButtonStyles = css`
  color: red;
  border: none;
  background-color: white;
  font-size: 24px;
  cursor: pointer;
`;
const personStyles = css`
  padding: 12px 0px;
`;

type Props =
  | {
      peopleInDb: Person[];
    }
  | {
      eventsInDb: Event[];
    }
  | {
      error: string;
    }
  | {
      user: { id: number; username: string };
    };

type Errors = { message: string }[];

export default function CreateEvent(props: Props) {
  const [personName, setPersonName] = useState('');
  const [eventName, setEventName] = useState('');
  const [peopleList, setPeopleList] = useState<Person[]>(props.peopleInDb);
  const [errors, setErrors] = useState<Errors>([]);

  if ('error' in props) {
    return (
      <main>
        <p>{props.error}</p>
      </main>
    );
  }

  async function deletePerson(id: number) {
    const deleteResponse = await fetch(`/api/person`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personId: id,
        user: props.user,
      }),
    });
    const deletePersonResponseBody =
      (await deleteResponse.json()) as CreatePersonResponseBody;

    if ('error' in deletePersonResponseBody) {
      setErrors(deletePersonResponseBody.errors);
      return;
    }

    const newPeopleList = peopleList.filter((person) => {
      return deletePersonResponseBody.person.id !== person.id;
    });

    setPeopleList(newPeopleList);
  }

  return (
    <>
      <Head>
        <title>Events</title>
        <meta name="Create New Events" content="" />
      </Head>
      <div css={mainContainerDivStyles}>
        <div css={smallContainerDivStyles}>
          <h1>Add People for your events</h1>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const createPersonResponse = await fetch('/api/person', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: personName,
                  user: props.user,
                }),
              });

              const createPersonResponseBody =
                (await createPersonResponse.json()) as CreatePersonResponseBody;

              const createdPeople = [
                ...peopleList,
                createPersonResponseBody.person,
              ];
              setPeopleList(createdPeople);

              setPersonName('');
              if ('errors' in createPersonResponseBody) {
                setErrors(createPersonResponseBody.errors);
                return;
              }
            }}
            css={formStyles}
          >
            <label htmlFor="e-mail">
              <span css={spanStyles}>Name</span>
            </label>
            <input
              css={nameInputStyles}
              data-test-id="create-person"
              placeholder="Name"
              value={personName}
              onChange={(e) => setPersonName(e.currentTarget.value)}
              required
            />

            <input
              css={inputSubmitStyles}
              data-test-id="complete-create-person"
              type="submit"
              value="Create"
            />
          </form>
          <div css={divGridListStyles}>
            {peopleList.map((person: Person) => {
              return (
                <div
                  data-test-id={`product-${person.id}`}
                  key={`this is ${person.name} witdh ${person.id}`}
                >
                  <div css={personStyles}>
                    <span css={spanStyles}>{person.name}</span>
                    <button
                      css={removeButtonStyles}
                      onClick={() => {
                        deletePerson(person.id).catch(() => {});
                      }}
                    >
                      X
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
                (await createPersonResponse.json()) as CreatePersonResponseBody;

              // const person: object = createPersonResponseBody.person.name;
              // console.log(typeof person);
              // const createdPeople = [...peopleList, person];
              // setPeopleList(createdPeople);

              // console.log(peopleList);
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
      {props.eventsInDb.map((event: Event) => {
        return (
          <div
            data-test-id={`product-${event.id}`}
            key={`this is ${event.eventname} witdh ${Math.random()}`}
          >
            <h2 css={spanStyles}>{event.eventname}</h2>
            {props.peopleInDb.map((person: Person) => {
              return (
                <div
                  data-test-id={`product-${person.id}`}
                  key={`this is ${person.name} witdh ${Math.random()}`}
                >
                  <div>
                    <span css={spanStyles}>{person.name}</span>
                    <label htmlFor="event-person-expense">€</label>
                    <input />
                    <button>Save</button>
                  </div>
                </div>
              );
            })}
            <button>Calculate</button>
          </div>
        );
      })}

      <div css={errorStyles}>
        {errors.map((error) => {
          return <div key={`error-${error.message}`}>{error.message}</div>;
        })}
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
        error: 'You are not allowed to see this page, please login',
      },
    };
  }
  const user = await getUserByValidSessionToken(sessionToken);

  if (!user) {
    return {
      props: {
        error: 'You are not logged in',
      },
    };
  }
  const peopleInDb = await getAllPeopleWhereIdMatches(user.id);
  if (!peopleInDb) {
    return {
      props: {
        error: 'You are not logged in',
      },
    };
  }
  const eventsInDb = await getAllEventsWhereIdMatches(user.id);
  if (!eventsInDb) {
    return {
      props: {
        error: 'You are not logged in',
      },
    };
  }

  return {
    props: {
      peopleInDb: peopleInDb,
      eventsInDb: eventsInDb,
      user: user,
    },
  };
}
