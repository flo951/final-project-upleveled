import { expenses, people } from '@prisma/client';
import { DeleteExpenseResponseBody } from '../pages/api/expense';
import { Errors, formStyles, spanStyles } from '../pages/createevent';
import {
  expenseContainerStyles,
  expenseDetailStyles,
  inputExpenseStyles,
  inputExpenseSubmitStyles,
  removeButtonStyles,
  selectStyles,
  spanErrorStyles,
} from '../pages/users/[eventId]';
import { Expense, Person } from '../util/database';

type Props = {
  personExpense: string;
  setPersonExpense: (person: string) => void;
  expenseError: string;
  setExpenseError: (error: string) => void;
  selectedPersonId: number;
  expenseName: string;
  setExpenseName: (name: string) => void;
  expenseList: expenses[];
  setExpenseList: (expense: expenses[]) => void;
  setErrors: (error: Errors | undefined) => void;
  peopleList: people[];
  eventId: number;
  deleteExpense: (expenseId: number) => void;
  handleSelectPerson: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};
export default function ExpenseList(props: Props) {
  return (
    <>
      <form
        css={formStyles}
        onSubmit={async (e) => {
          e.preventDefault();

          if (parseFloat(props.personExpense) <= 0) {
            props.setExpenseError(
              'Invalid input, please enter a positive value',
            );
            return;
          }
          const testNumber: number = parseInt(props.personExpense);

          if (!Number.isInteger(testNumber)) {
            props.setExpenseError('Invalid input, please enter a number');
            return;
          }

          if (props.selectedPersonId === 0) {
            props.setExpenseError('Please select a person');
            return;
          }

          const createPersonResponse = await fetch('/api/expense', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              expensename: props.expenseName,
              cost: parseFloat(props.personExpense) * 100,
              eventId: props.eventId,
              paymaster: props.selectedPersonId,
            }),
          });

          const createExpenseResponseBody =
            (await createPersonResponse.json()) as DeleteExpenseResponseBody;

          const createdExpenses: expenses[] = [
            ...props.expenseList,
            createExpenseResponseBody.expense,
          ];
          if ('errors' in createExpenseResponseBody) {
            props.setErrors(createExpenseResponseBody.errors);
            return;
          }

          props.setExpenseList(createdExpenses);
          props.setExpenseName('');
          props.setPersonExpense('0');

          props.setErrors([]);
          props.setExpenseError('');
        }}
      >
        <div css={expenseContainerStyles}>
          <h3>Expense List</h3>
          <label htmlFor="person-list">Who is paying?</label>
          <select
            data-test-id="select-person"
            id="person-list"
            onChange={props.handleSelectPerson}
            required
            css={selectStyles}
          >
            <option key="template" value={0}>
              Select Person
            </option>
            {props.peopleList.map((person) => {
              return (
                person.event_id === props.eventId && (
                  <option
                    key={`person-${person.name}-${person.id}`}
                    value={person.id}
                  >
                    {person.name}
                  </option>
                )
              );
            })}
          </select>
          <label htmlFor="expense">Cost</label>
          <input
            data-test-id="expense-value"
            css={inputExpenseStyles}
            id="expense"
            value={props.personExpense}
            placeholder="0 €"
            required
            onChange={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/,/g, '.');
              props.setPersonExpense(e.currentTarget.value);
            }}
          />

          <label htmlFor="expense-name">What are you paying for?</label>
          <input
            css={inputExpenseStyles}
            data-test-id="expense-name"
            id="expense-name"
            value={props.expenseName}
            placeholder="Name of the Expense"
            required
            onChange={(e) => {
              props.setExpenseName(e.currentTarget.value);
            }}
          />
          {props.expenseError && (
            <span css={spanErrorStyles}> {props.expenseError}</span>
          )}
          <input
            data-test-id="complete-expense"
            css={inputExpenseSubmitStyles}
            type="submit"
            name="submit"
            value="Add Expense"
          />
        </div>
      </form>
      {props.expenseList.map((expense) => {
        return (
          <div key={`expense-${expense.id}}`}>
            <div css={expenseDetailStyles}>
              <span data-test-id="expense-value-name" css={spanStyles}>
                {props.peopleList.map((person) => {
                  return (
                    person.id === expense.paymaster && (
                      <span key={`expense from person with id ${person.id}`}>
                        {expense.expensename} {expense.cost! / 100}€ paid by{' '}
                        {person.name}
                      </span>
                    )
                  );
                })}
              </span>

              <button
                css={removeButtonStyles}
                aria-label={`Delete Button for Expense: ${expense.expensename}`}
                onClick={() => {
                  props.deleteExpense(expense.id);
                }}
              >
                X
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
