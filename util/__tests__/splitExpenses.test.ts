import { splitPayments } from '../splitPayments';

const testObjectPayments = {
  Antje: 197.75,
  Flo: 306.75,
  Jose: 97.75,
  Tobi: -602.25,
};

const testResultPayments = [
  ' Tobi owes Flo 306.75€',
  ' Tobi owes Antje 197.75€',
  ' Tobi owes Jose 97.75€',
];

test('Calculate payments that are owed', () => {
  expect(splitPayments(testObjectPayments)).toStrictEqual(testResultPayments);
});
