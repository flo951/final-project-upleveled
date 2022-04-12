import { DeleteExpenseResponseBody } from '../pages/api/expense';
import { Errors, formStyles, spanStyles } from '../pages/createevent';
import { inputExpenseStyles } from '../pages/users/[eventId]';
import { Expense, Person } from '../util/database';

type Props = {
  personExpense: string;
  setPersonExpense: (person: string) => void;
  expenseError: string;
  setExpenseError: (error: string) => void;
  selectedPersonId: number;
  expenseName: string;
  setExpenseName: (name: string) => void;
  expenseList: Expense[];
  setExpenseList: (expense: Expense[]) => void;
  errors: Errors | undefined;
  setErrors: (error: Errors) => void;
  peopleList: Person[];
  eventId: number;
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

          const createPersonResponseBody =
            (await createPersonResponse.json()) as DeleteExpenseResponseBody;

          const createdExpenses: Expense[] = [
            ...props.expenseList,
            createPersonResponseBody.expense,
          ];
          if ('errors' in createPersonResponseBody) {
            props.setErrors(createPersonResponseBody.errors);
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
            onChange={handleSelectPerson}
            required
            css={selectStyles}
          >
            <option key="template" value={0}>
              Select Person
            </option>
            {props.peopleList.map((person) => {
              return (
                person.eventId === event.id && (
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
            <span css={spanErrorStyles}> {expenseError}</span>
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
                        {expense.expensename} {expense.cost / 100}€ paid by{' '}
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
                  deleteExpense(expense.id).catch(() => {});
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
