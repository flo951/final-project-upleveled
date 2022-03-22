import { Bar } from 'react-chartjs-2';
import { ArcElement } from 'chart.js';
import Chart from 'chart.js/auto';
import { css } from '@emotion/react';
import { spanStyles } from '../pages/createevent';
import { redColorCostsStyles } from '../pages/users/[eventId]';
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
type Props = {
  people: Person[];
  expenses: Expense[];
  sharedCosts: string;
};

export default function DoughnutChart(props: Props) {
  if (props.people.length === 0) {
    return (
      <div css={barChartStyles}>
        <h3>Add People and Expenses to see more</h3>
      </div>
    );
  }
  console.log(props);
  const peopleNameArray = props.people.map((person) => person.name);

  const expensePerPerson = props.people.map((person) => {
    const cost = props.expenses.map((expense) => {
      return person.id === expense.paymaster ? expense.cost / 100 : 0;
    });

    const sum = cost.reduce((partialSum, a) => partialSum + a, 0);
    const personSum =
      Math.round((sum - parseFloat(props.sharedCosts)) * 100) / 100;
    return { personSum: { sum: personSum, personId: person.id } };
  });

  type Balances = { sum: number; personId: number };

  const positiveBalances: Balances[] = [];
  const negativeBalances: Balances[] = [];

  for (let i = 0; i < expensePerPerson.length; i++) {
    if (expensePerPerson[i].personSum.sum > 0) {
      positiveBalances.push(expensePerPerson[i].personSum);
    } else if (expensePerPerson[i].personSum.sum < 0) {
      negativeBalances.push(expensePerPerson[i].personSum);
    }
  }

  // const copyPeople = [...props.people];
  // const test = props.people.map((person) => {
  //   const cost = props.expenses.map((expense) => {
  //     return person.id === expense.paymaster ? expense.cost / 100 : 0;
  //   });

  //   const sum = cost.reduce((partialSum, a) => partialSum + a, 0);
  //   const personSum =
  //     Math.round((sum - parseFloat(props.sharedCosts)) * 100) / 100;

  //   return personSum;
  // });

  // console.log(test);

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
          indexAxis: 'x' as const,
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
              {person.name}
              {personSum < 0 ? ' Owes ' : ' Receives '}
              {/* {personSum < 0 && person.id !== negativeBalances.[0].personId
                ? ` Owes ${negativeBalances.[0].sum} to Flo `
                : ' Receives '} */}

              <span
                key={Math.random()}
                css={personSum >= 0 ? spanStyles : redColorCostsStyles}
              >
                {personSum.toFixed(2)}€
              </span>
            </span>
            {/* {positiveBalances.map((balance) => {
              return balance.personId;
            })} */}
          </div>
        );
      })}
    </div>
  );
}
