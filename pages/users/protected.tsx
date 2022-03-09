import { GetServerSidePropsContext } from 'next';
import {
  Event,
  Expense,
  getAllEventsWhereIdMatches,
  getAllExpensesWhereIdMatches,
  getAllPeopleWhereUserIdMatches,
  getUserByValidSessionToken,
  Person,
} from '../../util/database';
import { css } from '@emotion/react';
import Head from 'next/head';
import { useState } from 'react';
import { DeletePersonResponseBody } from '../api/person';
import {
  divGridListStyles,
  formStyles,
  inputSubmitStyles,
  nameInputStyles,
  personStyles,
  smallContainerDivStyles,
  spanStyles,
} from '../createevent';

const mainStyles = css`
  margin: 1rem 1rem;
`;
const removeButtonStyles = css`
  color: red;
  border: none;
  background-color: white;
  font-size: 18px;
  cursor: pointer;
`;
const eventNameButtonRowStyles = css`
  display: flex;
  h4 {
    font-size: 18px;
  }
`;

type Props = {
  user: { id: number; username: string };
  eventsInDb: Event[];
  peopleInDb: Person[];
  expensesInDb: Expense[];
  errors: string;
};
type Errors = { message: string }[];
export default function ProtectedUser(props: Props) {
  const [personExpense, setPersonExpense] = useState<number>(0);
  const [expenseName, setExpenseName] = useState('');
  const [personName, setPersonName] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<number>(0);
  const [peopleList, setPeopleList] = useState<Person[]>(props.peopleInDb);
  const [errors, setErrors] = useState<Errors | undefined>([]);
  console.log(errors);
  if ('errors' in props) {
    return (
      <main>
        <p>{props.errors}</p>
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
      (await deleteResponse.json()) as DeletePersonResponseBody;

    if ('error' in deletePersonResponseBody) {
      setErrors(deletePersonResponseBody.errors);
      return;
    }

    const newPeopleList = peopleList.filter((person) => {
      return deletePersonResponseBody.person.id !== person.id;
    });

    setPeopleList(newPeopleList);
  }

  async function deleteEvent(id: number) {
    console.log(id);
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
      (await deleteResponse.json()) as DeletePersonResponseBody;

    if ('error' in deleteEventResponseBody) {
      setErrors(deleteEventResponseBody.errors);
      return;
    }
  }

  function handleSelectPerson(event: React.ChangeEvent<HTMLSelectElement>) {
    const person = event.target.value;

    setSelectedPersonId(parseInt(person));
    setSelectedPerson(person);
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
      <main css={mainStyles}>
        <h2>Welcome {props.user.username}</h2>
        <h3>This are your events</h3>
        {props.eventsInDb.map((event: Event) => {
          return (
            <div
              data-test-id={`product-${event.id}`}
              key={`this is ${event.eventname} witdh ${event.id}`}
            >
              <div css={eventNameButtonRowStyles}>
                <h2>{event.eventname}</h2>
                <button
                  css={removeButtonStyles}
                  onClick={() => {
                    deleteEvent(event.id).catch(() => {});
                  }}
                >
                  X
                </button>
              </div>
              <div css={smallContainerDivStyles}>
                <h4>Add People</h4>

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
                        eventId: event.id,
                      }),
                    });

                    const createPersonResponseBody =
                      (await createPersonResponse.json()) as DeletePersonResponseBody;

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
                    return person.eventId === event.id ? (
                      <div
                        data-test-id={`product-${person.id}`}
                        key={`this is ${person.name} witdh ${person.id} from event ${event.id}`}
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
                    ) : (
                      ''
                    );
                  })}
                </div>

                <div>
                  <div
                    data-test-id={`product-${event.id}`}
                    key={`this is ${event.eventname} witdh ${event.id}`}
                  >
                    <select id="dropdown" onChange={handleSelectPerson}>
                      <option key="template" value="">
                        Select Person
                      </option>
                      {peopleList.map((person) => {
                        return person.eventId === event.id ? (
                          <option
                            key={`person-${person.name}-${person.id}`}
                            value={person.id}
                          >
                            {person.name}
                          </option>
                        ) : (
                          ''
                        );
                      })}
                    </select>

                    <div>
                      <div>
                        <form
                          css={formStyles}
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (selectedPersonId === 0) {
                              return;
                            }
                            const createPersonResponse = await fetch(
                              '/api/expense',
                              {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  expensename: expenseName,
                                  cost: personExpense,
                                  eventId: event.id,
                                  paymaster: selectedPersonId,
                                }),
                              },
                            );

                            const createPersonResponseBody =
                              (await createPersonResponse.json()) as DeletePersonResponseBody;
                            console.log(createPersonResponseBody);
                            // const createdPeople = [
                            //   ...peopleList,
                            //   createPersonResponseBody.person,
                            // ];
                            // setPeopleList(createdPeople);

                            setExpenseName('');
                            setPersonExpense(0);
                            if ('errors' in createPersonResponseBody) {
                              setErrors(createPersonResponseBody.errors);
                              return;
                            }
                          }}
                        >
                          <span css={spanStyles}>
                            Person id{selectedPerson}
                          </span>
                          <label htmlFor="event-person-expense">€</label>
                          <input
                            value={personExpense}
                            type="number"
                            placeholder="Value"
                            onChange={(e) => {
                              setPersonExpense(parseInt(e.currentTarget.value));
                            }}
                          />
                          <label htmlFor="event-person-expense">Expense</label>
                          <input
                            value={expenseName}
                            placeholder="Name"
                            onChange={(e) => {
                              setExpenseName(e.currentTarget.value);
                            }}
                          />
                          <input type="submit" value="Add" />
                        </form>
                      </div>
                      {props.expensesInDb.map((expense) => {
                        return expense.eventId === event.id ? (
                          <div key={`expense-${expense.id}`}>
                            <span>{expense.expensename} </span>
                            <span>{expense.cost} € </span>
                            <span>
                              Paid by
                              {peopleList.map((person) => {
                                return person.id === expense.paymaster
                                  ? person.name
                                  : '';
                              })}
                            </span>

                            <button
                              css={removeButtonStyles}
                              // onClick={() => {
                              //   deleteExpense(expense.id).catch(() => {});
                              // }}
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          ''
                        );
                      })}
                      {/* <span>Total {expensesSum} €</span> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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

  const peopleInDb = await getAllPeopleWhereUserIdMatches(user.id);

  if (!peopleInDb) {
    return {
      props: {
        errors: 'You are not logged in',
      },
    };
  }

  const expensesInDb = await getAllExpensesWhereIdMatches();

  return {
    props: {
      user: user,
      eventsInDb: eventsInDb,
      peopleInDb: peopleInDb,
      expensesInDb: expensesInDb,
    },
    // redirect: {
    //   destination: '/login?returnTo=/users/protectedUser',
    //   permanent: false,
    // },
  };
}
