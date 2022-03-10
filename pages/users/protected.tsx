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
import { CreateEventResponseBody } from '../api/event';
import { DeleteExpenseResponseBody } from '../api/expense';

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
const selectStyles = css`
  padding: 8px;
  font-size: 22px;
`;
const inputExpenseStyles = css`
  padding: 8px;
  width: 150px;
  font-size: 22px;
`;
const expenseContainerStyles = css`
  display: flex;
  flex-direction: column;
`;
const expenseBigContainerStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const inputExpenseSubmitStyles = css`
  background-color: #2a6592;
  margin-top: 12px;
  padding: 4px;
  font-size: 24px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
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
  const [personExpense, setPersonExpense] = useState(0);
  const [expenseName, setExpenseName] = useState('');
  const [personName, setPersonName] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<number>(0);
  const [peopleList, setPeopleList] = useState<Person[]>(props.peopleInDb);
  const [eventList, setEventList] = useState<Event[]>(props.eventsInDb);
  const [expenseList, setExpenseList] = useState<Expense[]>(props.expensesInDb);
  const [errors, setErrors] = useState<Errors | undefined>([]);
  const [noSelectError, setNoSelectError] = useState('');
  console.log(selectedPerson);
  console.log(errors);
  if ('errors' in props) {
    return (
      <main>
        <p>{props.errors}</p>
      </main>
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
      return;
    }
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

    //  if(typeof deleteEventResponseBody === 'undefined') {
    //   return;

    // }
    const newEventList = eventList.filter((event) => {
      return deleteEventResponseBody.event.id !== event.id;
    });

    setEventList(newEventList);
  }
  async function deleteExpense(id: number) {
    console.log(id);
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
    setSelectedPerson(person);
  }

  // function calculateTotalSumPerEvent(eventId: number) {
  //   const cost = props.expensesInDb.map((expense) => {
  //     if (eventId === expense.eventId) {
  //       return expense.cost;
  //     } else {
  //       return console.log('no value passed');
  //     }
  //   });

  //   const sum = cost.reduce((partialSum, a) => partialSum + a, 0);
  //   console.log(sum);
  // }

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
        {/* Event List */}
        <h3>Welcome {props.user.username}, this are your events</h3>
        {eventList.map((event: Event) => {
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
                {/* Create People List */}
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

                <div css={expenseBigContainerStyles}>
                  <select
                    id="dropdown"
                    onChange={handleSelectPerson}
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

                  {/* Create Expense List */}
                  <form
                    css={formStyles}
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (selectedPersonId === 0) {
                        setNoSelectError('No Person selected');
                        return;
                      }
                      const createPersonResponse = await fetch('/api/expense', {
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
                      });

                      const createPersonResponseBody =
                        (await createPersonResponse.json()) as DeleteExpenseResponseBody;
                      console.log(createPersonResponseBody);

                      const createdExpenses: Expense[] = [
                        ...expenseList,
                        createPersonResponseBody.expense,
                      ];

                      setExpenseList(createdExpenses);
                      setExpenseName('');
                      setPersonExpense(0);
                      if ('errors' in createPersonResponseBody) {
                        setErrors(createPersonResponseBody.errors);
                        return;
                      }
                    }}
                  >
                    <div css={expenseContainerStyles}>
                      <label htmlFor="event-person-expense">Cost in €</label>
                      <input
                        css={inputExpenseStyles}
                        value={personExpense}
                        type="number"
                        placeholder="Cost"
                        onChange={(e) => {
                          setPersonExpense(parseInt(e.currentTarget.value));
                        }}
                      />
                      <label htmlFor="event-person-expense">Expense</label>
                      <input
                        css={inputExpenseStyles}
                        value={expenseName}
                        placeholder="Expense"
                        onChange={(e) => {
                          setExpenseName(e.currentTarget.value);
                        }}
                      />
                      <input
                        css={inputExpenseSubmitStyles}
                        type="submit"
                        value="Add"
                      />
                    </div>
                  </form>

                  <p>{noSelectError}</p>
                  {expenseList.map((expense) => {
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
                  {/* <button onClick={calculateTotalSumPerEvent(event.id)}>
                        Sum
                      </button> */}
                  {/* <span>Total {expensesSum} €</span> */}
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
