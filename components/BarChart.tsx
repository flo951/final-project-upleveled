import { Bar } from 'react-chartjs-2';
import { ArcElement } from 'chart.js';
import Chart from 'chart.js/auto';
import { css } from '@emotion/react';
import { inputSubmitStyles, spanStyles } from '../pages/createevent';
import { splitPayments } from '../util/splitPayments';
import { formStyles } from '../styles/styles';
import { useState } from 'react';
import {
  inputExpenseStyles,
  loadingCircleStyles,
  loadingFlexBox,
} from '../pages/users/[eventId]';
import { Expense, Person } from '../util/database';

Chart.register(ArcElement);

const barChartStyles = css`
  width: 350px;
  height: fit-content;
  padding: 12px 0;
  margin-bottom: 12px;
  border: 2px solid black;
  border-radius: 8px;
  text-align: center;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
`;
const resultStyles = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

type Props = {
  people: Person[];
  expenses: Expense[];
  sharedCosts: string;
};

export default function BarChart(props: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailResponse, setEmailResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const sendList: string[] = [];
  props.expenses.map((expense) => {
    return props.people.map((person) => {
      return person.id === expense.paymaster
        ? sendList.push(
            ` ${expense.expensename} ${expense.cost / 100}€ paid by ${
              person.name
            }`,
          )
        : '';
    });
  });

  if (props.expenses.length === 0) {
    return (
      <div css={barChartStyles}>
        <h3>Add People and Expenses to see more</h3>
      </div>
    );
  }

  const expensePerPerson = props.people.map((person) => {
    const cost = props.expenses.map((expense) => {
      return person.id === expense.paymaster ? expense.cost / 100 : 0;
    });

    const sum = cost.reduce((partialSum, a) => partialSum + a, 0);
    const personSum =
      Math.round((sum - parseFloat(props.sharedCosts)) * 100) / 100;
    return {
      personSum: {
        sum: personSum,
        personId: person.id,
        personName: person.name,
      },
    };
  });

  // Balances for each person
  const balances = [];

  for (let i = 0; i < expensePerPerson.length; i++) {
    balances.push(expensePerPerson[i].personSum);
  }

  // Sort balance and name from each person and assign it into a single object
  const payments = balances.reduce(
    (obj, item) => Object.assign(obj, { [item.personName]: item.sum }),
    {},
  );

  const balanceMessages = splitPayments(payments);

  const peopleNameArray = props.people.map((person) => person.name);
  const data = {
    labels: peopleNameArray,
    datasets: [
      {
        label: 'Positive Balance in €',
        data: expensePerPerson.map((expense) => {
          return expense.personSum.sum > 0 ? expense.personSum.sum : 0;
        }),
        options: {
          plugins: {
            subtitle: {
              display: true,
              text: 'Title',
            },
          },
        },
        backgroundColor: ['rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
      {
        label: 'Negative Balance in €',
        data: expensePerPerson.map((expense) => {
          return expense.personSum.sum < 0 ? expense.personSum.sum : 0;
        }),
        options: {
          plugins: {
            subtitle: {
              display: true,
              text: 'Title',
            },
          },
        },
        backgroundColor: ['rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };
  return (
    <>
      <div css={barChartStyles}>
        <Bar
          data={data}
          height={300}
          options={{
            indexAxis: 'x',
            elements: {
              bar: {
                borderWidth: 2,
              },
            },
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Total Balance of each Participant in €',
              },
              legend: {
                display: true,
                position: 'bottom',
              },
            },
          }}
        />
        <div css={resultStyles}>
          <span css={spanStyles}>Result</span>
          {balanceMessages.map((item) => {
            return (
              <span key={`id ${Math.random()}`} css={spanStyles}>
                {item}
              </span>
            );
          })}

          {props.people.map((person) => {
            const cost = props.expenses.map((expense) => {
              return person.id === expense.paymaster ? expense.cost / 100 : 0;
            });

            const sum = cost.reduce((partialSum, a) => partialSum + a, 0);
            const personSum =
              Math.round((sum - parseFloat(props.sharedCosts)) * 100) / 100;

            return (
              <span
                key={`person-${person.id} receives money `}
                css={spanStyles}
              >
                {personSum > 0
                  ? ` ${person.name} receives ${personSum.toFixed(2)}€`
                  : ''}
              </span>
            );
          })}
        </div>
      </div>

      <div css={barChartStyles}>
        <h3>Send the result to your friends</h3>
        <form
          css={formStyles}
          onSubmit={async (e) => {
            e.preventDefault();
            setEmailResponse('');
            setIsLoading(true);
            const createEmailResponse = await fetch('/api/email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: name,
                email: email,
                message: message,
                expenseList: sendList,
                result: balanceMessages,
              }),
            });
            const createEmailResponseBody = await createEmailResponse.json();

            setName('');
            setEmail('');
            setMessage('');
            setIsLoading(false);
            setEmailResponse(
              `E-Mail send successfully to ${createEmailResponseBody.mailData.accepted}`,
            );
          }}
        >
          <label htmlFor="name">Name</label>
          <input
            css={inputExpenseStyles}
            value={name}
            name="name"
            required
            onChange={(e) => {
              setName(e.target.value);
            }}
            placeholder="Name"
          />

          <label htmlFor="email">Who is receiving your E-Mail?</label>
          <input
            css={inputExpenseStyles}
            value={email}
            type="email"
            name="email"
            required
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="E-Mail"
          />

          <label htmlFor="message">Message</label>
          <textarea
            css={inputExpenseStyles}
            value={message}
            required
            name="message"
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            placeholder="Message"
          />

          <input type="submit" value="Send E-Mail" css={inputSubmitStyles} />
          <span>
            {isLoading ? (
              <div css={loadingFlexBox}>
                <span css={spanStyles}>Sending E-Mail...</span>
                <div css={loadingCircleStyles} />
              </div>
            ) : (
              ''
            )}
          </span>

          <span>{emailResponse}</span>
        </form>
      </div>
    </>
  );
}
