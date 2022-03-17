import { Doughnut } from 'react-chartjs-2';
import { ArcElement } from 'chart.js';
import Chart from 'chart.js/auto';
import { css } from '@emotion/react';
Chart.register(ArcElement);

const doughnutStyles = css`
  width: 350px;
  padding: 12px 0;
  border: 2px solid black;
  border-radius: 8px;
  text-align: center;
`;

export default function DoughnutChart(props) {
  if (props.people.length === 0) {
    return (
      <div css={doughnutStyles}>
        <h3>Add People & Expenses to see more</h3>
      </div>
    );
  }

  const peopleNameArray = props.people.map((person) => person.name);

  const expensePerPerson = props.people.map((person) => {
    const cost = props.expenses.map((expense) => {
      return person.id === expense.paymaster ? expense.cost / 100 : 0;
    });

    const sum = cost.reduce((partialSum, a) => partialSum + a, 0);
    const personSum =
      Math.round((sum - parseFloat(props.sharedCosts)) * 100) / 100;
    return personSum;
  });

  const data = {
    labels: peopleNameArray,
    datasets: [
      {
        label: '# of Votes',
        data: expensePerPerson,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  return (
    <div css={doughnutStyles}>
      <span>Click on labels to remove someone</span>
      <br />

      <Doughnut data={data} />
    </div>
  );
}
