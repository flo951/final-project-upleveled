import { Bar } from 'react-chartjs-2';
import { ArcElement } from 'chart.js';
import Chart from 'chart.js/auto';
import { css } from '@emotion/react';
import { spanStyles } from '../pages/createevent';
import { splitPayments } from '../util/splitPayments';

import { expenses, people } from '@prisma/client';

Chart.register(ArcElement);

export const barChartStyles = css`
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
  people: people[];
  expenses: expenses[];
  sharedCosts: string;
};

export type DynamicKeyValueObject = {
  [key: string]: number;
};

export default function BarChart(props: Props) {
  const sendExpenseList: string[] = [];
  props.expenses.map((expense) => {
    return props.people.map((person) => {
      return (
        person.id === expense.paymaster &&
        sendExpenseList.push(
          ` ${expense.expensename} ${expense.cost! / 100}€ paid by ${
            person.name
          }`,
        )
      );
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
      return person.id === expense.paymaster ? expense.cost! / 100 : 0;
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
  const payments: DynamicKeyValueObject = balances.reduce(
    (obj, item) => Object.assign(obj, { [item.personName]: item.sum }),
    {},
  );
  const balanceMessages = splitPayments(payments);

  const peopleNameArray = props.people.map((person) => person.name);

  const data = {
    labels: peopleNameArray,
    datasets: [
      {
        label: 'Positive Balances in €',
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
        label: 'Negative Balances in €',
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
            return person.id === expense.paymaster ? expense.cost! / 100 : 0;
          });

          const sum = cost.reduce((partialSum, a) => partialSum + a, 0);
          const personSum =
            Math.round((sum - parseFloat(props.sharedCosts)) * 100) / 100;

          return (
            personSum > 0 && (
              <span
                key={`person-${person.id} receives money `}
                css={spanStyles}
              >
                {` ${person.name} receives ${personSum.toFixed(2)}€`}
              </span>
            )
          );
        })}
      </div>
    </div>
  );
}
