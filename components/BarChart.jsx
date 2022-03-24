import { Bar } from 'react-chartjs-2';
import { ArcElement } from 'chart.js';
import Chart from 'chart.js/auto';
import { css } from '@emotion/react';
import { spanStyles } from '../pages/createevent';

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

export default function BarChart(props) {
  if (props.people.length === 0) {
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

  // Algorithm to calculate who owes how much to hwom
  function splitPayments(object) {
    const people = Object.keys(object);
    const valuesPaid = Object.values(object);

    // totalSum of all expenses
    const totalSum = valuesPaid.reduce((acc, curr) => curr + acc);

    // sharedAmount is the amount everyone that participates in an event has to pay
    const sharedAmount = totalSum / people.length;

    // Sort people Array from lowest to highest
    const sortedPeople = people.sort(
      (personA, personB) => object[personA] - object[personB],
    );

    // Sort values from lowest to highest
    const sortedValuesPaid = sortedPeople.map(
      (person) => object[person] - sharedAmount,
    );

    let i = 0;
    let j = sortedPeople.length - 1;
    let debt;
    const resultArray = [];
    while (i < j) {
      debt = Math.min(-sortedValuesPaid[i], sortedValuesPaid[j]);
      sortedValuesPaid[i] += debt;
      sortedValuesPaid[j] -= debt;
      resultArray.push(`${sortedPeople[i]} owes ${sortedPeople[j]} €${debt}`);

      if (sortedValuesPaid[i] === 0) {
        i++;
      }

      if (sortedValuesPaid[j] === 0) {
        j--;
      }
    }
    return resultArray;
  }

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
        {balanceMessages.map((item) => {
          return <span key={Math.random()}>{item}</span>;
        })}
      </div>
      {props.people.map((person) => {
        const cost = props.expenses.map((expense) => {
          return person.id === expense.paymaster ? expense.cost / 100 : 0;
        });

        const sum = cost.reduce((partialSum, a) => partialSum + a, 0);
        const personSum =
          Math.round((sum - parseFloat(props.sharedCosts)) * 100) / 100;
        return (
          <div key={`person-${person.id} owes money `}>
            <span css={spanStyles} key={Math.random()}>
              {personSum > 0
                ? ` ${person.name} Receives ${personSum.toFixed(2)}€`
                : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
