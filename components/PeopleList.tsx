import { useState } from 'react';
import { DeletePersonResponseBody } from '../pages/api/person';
import {
  divPersonListStyles,
  Errors,
  nameInputStyles,
  personStyles,
  spanStyles,
} from '../pages/createevent';
import { inputSubmitStyles } from '../pages/login';
import { removeButtonStyles } from '../pages/users/[eventId]';
import { formStyles } from '../styles/styles';
import { Expense, Person, User } from '../util/database';

type Props = {
  peopleInDb: Person[];
  user: User;
  setErrors: (errors: Errors) => void;
  expenseList: Expense[];
  setExpenseList: (expense: Expense[]) => void;
  eventId: number;
};
export default function PeopleList(props: Props) {
  const [peopleList, setPeopleList] = useState<Person[]>(props.peopleInDb);
  const [personName, setPersonName] = useState('');

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
      props.setErrors(deletePersonResponseBody.errors);
      return;
    }
    if ('person' in deletePersonResponseBody) {
      const newPeopleList = peopleList.filter((person) => {
        return deletePersonResponseBody.person.id !== person.id;
      });
      setPeopleList(newPeopleList);

      const newExpenseList = props.expenseList.filter((expense) => {
        return deletePersonResponseBody.person.id !== expense.paymaster;
      });
      props.setExpenseList(newExpenseList);

      return;
    }
  }
  return (
    <>
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
              eventId: props.eventId,
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
          return (
            person.eventId === event.id && (
              <div
                data-test-id={`person-width-id-${person.id}`}
                key={`this is ${person.name} witdh ${person.id} from event ${event.id}`}
              >
                <div css={personStyles}>
                  <span
                    css={spanStyles}
                    data-test-id={`name-${person.name}`}
                    data-id={person.id}
                  >
                    {person.name}
                  </span>
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
            )
          );
        })}
      </div>
    </>
  );
}
