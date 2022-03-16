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
  divPersonListStyles,
  Errors,
  formStyles,
  inputSubmitStyles,
  nameInputStyles,
  personStyles,
  smallContainerDivStyles,
  spanStyles,
} from '../createevent';
const mainStyles = css`
  margin-bottom: 12px;
`;
const removeButtonStyles = css`
  color: red;
  border: none;
  background-color: transparent;
  font-size: 16px;
  margin: 0px 2px;
  border: 2px solid black;
  border-radius: 8px;
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
const spanErrorStyles = css`
  color: red;
  font-size: 20px;
`;
const expenseBigContainerStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border: 2px solid black;
  border-radius: 8px;
  padding: 12px;
  margin: 12px auto;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  width: 324px;
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
const expenseStatisticsStyles = css`
  border-bottom: 2px solid black;
  padding: 4px;
  width: 100%;
`;
const redColorCostsStyles = css`
  color: #db3f2e;
`;
const borderPeopleListStyles = css`
  border: 2px solid black;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  padding: 12px;
  width: 324px;
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
        return deletePersonResponseBody.person.id !== expense.paymaster;
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
              <div css={smallContainerDivStyles}>
                {/* Create People List */}
                <div css={borderPeopleListStyles}>
                  <div css={eventNameButtonRowStyles}>
                    <h3> Who is participating at {event.eventname}?</h3>
                  </div>
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
                    <label htmlFor="person-name">Name of Person</label>
                    <input
                      css={nameInputStyles}
                      data-test-id="create-person"
                      id="person-name"
                      placeholder="Name"
                      value={personName}
                      onChange={(e) => setPersonName(e.currentTarget.value)}
                      required
                    />

                    <input
                      css={inputSubmitStyles}
                      data-test-id="complete-create-person"
                      type="submit"
                      value="Add Person"
                    />
                  </form>
                  <div css={divPersonListStyles}>
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
                              aria-label={`Delete Button for Person: ${person.name}`}
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
                </div>

                <div css={expenseBigContainerStyles}>
                  {/* Create Expense List */}

                  <form
                    css={formStyles}
                    onSubmit={async (e) => {
                      e.preventDefault();

                      if (personExpense === '0') {
                        setExpenseError('Sure its free?');
                        return;
                      }
                      const testNumber: number = parseInt(personExpense);

                      if (!Number.isInteger(testNumber)) {
                        setExpenseError('Invalid input, please enter a number');
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
                      setErrors([]);
                      setExpenseError('');
                    }}
                  >
                    <div css={expenseContainerStyles}>
                      <label htmlFor="person-list">Who is paying?</label>
                      <select
                        id="person-list"
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
                        id="expense"
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
                      {expenseError ? (
                        <span css={spanErrorStyles}> {expenseError}</span>
                      ) : (
                        ''
                      )}
                      <label htmlFor="expense-name">
                        What are you paying for?
                      </label>
                      <input
                        css={inputExpenseStyles}
                        id="expense-name"
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
                        name="submit"
                        value="Add Expense"
                      />
                    </div>
                  </form>

                  {expenseList.map((expense) => {
                    return expense.eventId === event.id ? (
                      <>
                        <div
                          css={expenseDetailStyles}
                          key={`expense-${expense.id}`}
                        >
                          <span css={spanStyles}>
                            {peopleList.map((person) => {
                              return person.id === expense.paymaster
                                ? `${expense.expensename} ${
                                    expense.cost / 100
                                  }€ paid by ${person.name}`
                                : '';
                            })}
                          </span>

                          <button
                            css={removeButtonStyles}
                            aria-label={`Delete Button for Expense: ${expense.expensename}`}
                            onClick={() => {
                              deleteExpense(expense.id).catch(() => {});
                            }}
                          >
                            X
                          </button>
                        </div>
                        <div css={expenseStatisticsStyles}>
                          {peopleList.map((person) => {
                            const cost = expense.cost / 100 / peopleList.length;

                            return person.id !== expense.paymaster ? (
                              <div key={person.id}>
                                <span css={spanStyles}>
                                  {person.name} owes
                                  <span css={redColorCostsStyles}>
                                    {` ${cost.toFixed(2)}`}
                                  </span>
                                  {peopleList.map((p) => {
                                    return p.id === expense.paymaster
                                      ? `€ to ${p.name}`
                                      : '';
                                  })}
                                </span>
                              </div>
                            ) : (
                              ''
                            );
                          })}
                        </div>
                      </>
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

                {peopleList.map((person) => {
                  const cost = expenseList.map((expense) => {
                    return person.id === expense.paymaster
                      ? expense.cost / 100
                      : 0;
                  });

                  const sum = cost.reduce((partialSum, a) => partialSum + a, 0);
                  const personSum =
                    Math.round((sum - parseFloat(sharedCosts)) * 100) / 100;
                  return (
                    <div key={person.id}>
                      <span css={spanStyles}>
                        {person.name}
                        {personSum < 0 ? ' Owes ' : ' Receives '}
                        <span
                          css={
                            personSum >= 0 ? spanStyles : redColorCostsStyles
                          }
                        >
                          {Math.round((sum - parseFloat(sharedCosts)) * 100) /
                            100}
                          €
                        </span>
                      </span>
                    </div>
                  );
                })}

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
