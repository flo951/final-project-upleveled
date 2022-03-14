import { css } from '@emotion/react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import {
  Event,
  Expense,
  getAllExpensesWhereIdMatches,
  getAllPeopleWhereEventIdMatches,
  getSingleEvent,
  getUserByValidSessionToken,
  Person,
} from '../../util/database';
import { CreateEventResponseBody } from '../api/event';

import { DeleteExpenseResponseBody } from '../api/expense';
import { DeletePersonResponseBody } from '../api/person';
import {
  divGridListStyles,
  Errors,
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
  background-color: transparent;
  font-size: 20px;

  cursor: pointer;
`;
const eventNameButtonRowStyles = css`
  display: flex;
  justify-content: center;
  h4 {
    font-size: 18px;
  }
`;
const selectStyles = css`
  padding: 8px;
  font-size: 20px;
`;
const inputExpenseStyles = css`
  padding: 8px;

  font-size: 20px;
`;
const expenseContainerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const expenseBigContainerStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border: 2px solid black;
  border-radius: 8px;
  padding: 12px 4px;
  margin: 12px 0px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
`;
const inputExpenseSubmitStyles = css`
  background-color: #2a6592;
  margin-top: 12px;
  padding: 4px;
  font-size: 20px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
`;
const expenseDetailStyles = css`
  display: flex;
  font-size: 18px;
`;
const redColorCostsStyles = css`
  color: #db3f2e;
`;
type Props = {
  user: { id: number; username: string };
  eventInDb: Event;
  errors: string;
  peopleInDb: Person[];
  expensesInDb: Expense[];
};

export default function UserDetail(props: Props) {
  const [eventList, setEventList] = useState<Event[]>([props.eventInDb]);
  const [peopleList, setPeopleList] = useState<Person[]>(props.peopleInDb);
  const [personExpense, setPersonExpense] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [personName, setPersonName] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<number>(0);
  const [sumEventCosts, setSumEventCosts] = useState('0');
  const [sharedCosts, setSharedCosts] = useState('0');
  const [errors, setErrors] = useState<Errors | undefined>([]);
  const [expenseError, setExpenseError] = useState('');
  const [expenseList, setExpenseList] = useState<Expense[]>(props.expensesInDb);

  useEffect(() => {
    function calculateTotalSumPerEvent() {
      if (typeof props.eventInDb === 'undefined') {
        return {
          props: {
            errors: 'This event doesnt exist',
          },
        };
      }

      const cost: number[] = expenseList.map((expense) => {
        return expense.cost / 100;
      });

      const sum = cost.reduce((partialSum, a) => partialSum + a, 0);
      setSumEventCosts(sum.toFixed(2));

      const amountPeople = peopleList.filter((person) => {
        return person.name;
      });

      const costPaidByEveryone =
        Math.round((sum / amountPeople.length) * 100) / 100;

      setSharedCosts(costPaidByEveryone.toFixed(2));
    }
    calculateTotalSumPerEvent();
  }, [expenseList, peopleList, props.eventInDb]);
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
        <h1>{props.errors}</h1>
      </>
    );
  }

  // function to delete created people
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
    console.log(deletePersonResponseBody);
    if ('errors' in deletePersonResponseBody) {
      setErrors(deletePersonResponseBody.errors);
      return;
    }
    if ('person' in deletePersonResponseBody) {
      const newPeopleList = peopleList.filter((person) => {
        return deletePersonResponseBody.person.id !== person.id;
      });
      setPeopleList(newPeopleList);
      const newExpenseList = expenseList.filter((expense) => {
        return deletePersonResponseBody.person.eventId !== expense.eventId;
      });
      setExpenseList(newExpenseList);

      return;
    }
  }

  async function deleteExpense(id: number) {
    const deleteResponse = await fetch(`/api/expense`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expenseId: id,
      }),
    });
    const deleteEventResponseBody =
      (await deleteResponse.json()) as DeleteExpenseResponseBody;

    if ('errors' in deleteEventResponseBody) {
      setErrors(deleteEventResponseBody.errors);
      return;
    }

    if ('expense' in deleteEventResponseBody) {
      const newExpenseList = expenseList.filter((expense) => {
        return deleteEventResponseBody.expense.id !== expense.id;
      });
      setExpenseList(newExpenseList);
      return;
    }
  }
  // select a created person in a dropdown as a template for adding expenses
  function handleSelectPerson(event: React.ChangeEvent<HTMLSelectElement>) {
    const person = event.target.value;

    setSelectedPersonId(parseInt(person));
  }

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

  return (
    <>
      <Head>
        <title>Event {props.eventInDb.eventname}</title>

        <meta
          name="description"
          content="View single event by id, this is event "
        />
      </Head>

      <main css={mainStyles}>
        {eventList.map((event: Event) => {
          return (
            <div
              data-test-id={`product-${event.id}`}
              key={`this is ${event.eventname} witdh ${event.id}`}
            >
              <div css={eventNameButtonRowStyles}>
                <h3> Who is participating at {event.eventname}?</h3>
              </div>
              <div css={smallContainerDivStyles}>
                {/* Create People List */}

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
                    if ('person' in createPersonResponseBody) {
                      const createdPeople = [
                        ...peopleList,
                        createPersonResponseBody.person,
                      ];
                      setPeopleList(createdPeople);

                      setPersonName('');
                      return;
                    }

                    if ('errors' in createPersonResponseBody) {
                      setErrors(createPersonResponseBody.errors);
                      return;
                    }
                  }}
                  css={formStyles}
                >
                  {errors}

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

                <div css={expenseBigContainerStyles}>
                  {/* Create Expense List */}
                  <h4>Who is paying?</h4>
                  <form
                    css={formStyles}
                    onSubmit={async (e) => {
                      e.preventDefault();

                      if (personExpense === '0') {
                        setExpenseError('Sure its free?');
                        return;
                      }

                      const createPersonResponse = await fetch('/api/expense', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          expensename: expenseName,
                          cost: parseFloat(personExpense) * 100,
                          eventId: event.id,
                          paymaster: selectedPersonId,
                        }),
                      });

                      const createPersonResponseBody =
                        (await createPersonResponse.json()) as DeleteExpenseResponseBody;

                      const createdExpenses: Expense[] = [
                        ...expenseList,
                        createPersonResponseBody.expense,
                      ];

                      setExpenseList(createdExpenses);
                      setExpenseName('');
                      setPersonExpense('0');
                      if ('errors' in createPersonResponseBody) {
                        setErrors(createPersonResponseBody.errors);
                        return;
                      }
                    }}
                  >
                    <div css={expenseContainerStyles}>
                      <select
                        id="dropdown"
                        onChange={handleSelectPerson}
                        required
                        css={selectStyles}
                      >
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
                      <label htmlFor="expense">Cost</label>
                      <input
                        css={inputExpenseStyles}
                        value={personExpense}
                        placeholder="0 €"
                        required
                        onChange={(e) => {
                          e.currentTarget.value = e.currentTarget.value.replace(
                            /,/g,
                            '.',
                          );
                          setPersonExpense(e.currentTarget.value);
                        }}
                      />
                      <label htmlFor="expense-name">
                        What are you paying for?
                      </label>
                      <input
                        css={inputExpenseStyles}
                        value={expenseName}
                        placeholder="Name of the Expense"
                        required
                        onChange={(e) => {
                          setExpenseName(e.currentTarget.value);
                        }}
                      />
                      <input
                        css={inputExpenseSubmitStyles}
                        type="submit"
                        value="Add"
                      />
                      {expenseError ? (
                        <span css={spanStyles}> 💸{expenseError}💸</span>
                      ) : (
                        ''
                      )}
                    </div>
                  </form>

                  {expenseList.map((expense) => {
                    return expense.eventId === event.id ? (
                      <div
                        css={expenseDetailStyles}
                        key={`expense-${expense.id}`}
                      >
                        <span css={spanStyles}>
                          {expense.expensename} {expense.cost / 100} € Paid by
                          {peopleList.map((person) => {
                            return person.id === expense.paymaster
                              ? person.name
                              : '';
                          })}
                        </span>

                        <button
                          css={removeButtonStyles}
                          onClick={() => {
                            deleteExpense(expense.id).catch(() => {});
                          }}
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      ''
                    );
                  })}

                  <span css={spanStyles}>
                    Participants: {peopleList.length}
                  </span>
                  <span css={spanStyles}> Total: {sumEventCosts} €</span>

                  {peopleList.length === 0 ? (
                    ''
                  ) : (
                    <span css={spanStyles}>
                      Everyone has to pay
                      <span css={redColorCostsStyles}> {sharedCosts} €</span>
                    </span>
                  )}
                </div>
                <button
                  css={removeButtonStyles}
                  onClick={() => {
                    deleteEvent(event.id).catch(() => {});
                  }}
                >
                  <span css={spanStyles}>Delete Event</span> X
                </button>
              </div>
            </div>
          );
        })}
      </main>
    </>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const eventId = context.query.eventId as string;
  if (typeof eventId === 'undefined') {
    return {
      props: {
        errors: 'This event doesnt exist',
      },
    };
  }

  const token = context.req.cookies.sessionToken;

  const user = await getUserByValidSessionToken(token);

  if (!user) {
    return {
      redirect: {
        destination: `/login?returnTo=/users/${eventId}`,
        permanent: false,
      },
    };
  }

  const eventInDb = await getSingleEvent(parseInt(eventId));

  if (typeof eventInDb === 'undefined') {
    return {
      props: {
        errors: 'This event doesnt exist',
      },
    };
  }

  if (user.id !== eventInDb.userId) {
    return {
      props: {
        errors: 'You are not allowed to see this page',
      },
    };
  }

  const peopleInDb = await getAllPeopleWhereEventIdMatches(parseInt(eventId));

  const expensesInDb = await getAllExpensesWhereIdMatches(parseInt(eventId));

  return {
    props: {
      user: user,
      eventInDb: eventInDb,
      peopleInDb: peopleInDb,
      expensesInDb: expensesInDb,
    },
  };
}
