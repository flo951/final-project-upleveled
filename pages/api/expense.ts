import { NextApiRequest, NextApiResponse } from 'next';
import {
  createExpense,
  deleteExpenseById,
  Expense,
  getUserByValidSessionToken,
} from '../../util/database';

export type CreateExpenseResponseBody =
  | { errors: { message: string }[] }
  | { expense: Expense };

export type DeleteExpenseResponseBody = {
  expense: Expense;
  errors?: { message: string }[];
};

type CreateEventRequestBody = {
  expensename: string;
  cost: number;
  eventId: number;
  expenseId?: number;
  paymaster: number;
};

type CreateEventNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: CreateEventRequestBody;
};

export default async function createEventHandler(
  request: CreateEventNextApiRequest,
  response: NextApiResponse<CreateExpenseResponseBody>,
) {
  if (request.method === 'POST') {
    if (
      typeof request.body.expensename !== 'string' ||
      !request.body.expensename ||
      typeof request.body.cost !== 'number' ||
      !request.body.cost ||
      typeof request.body.paymaster !== 'number' ||
      request.body.paymaster === 0
    ) {
      // 400 bad request
      response.status(400).json({
        errors: [
          {
            message:
              'Expense Name not provided or cost value invalid or paymaster id is 0',
          },
        ],
      });
      return; // Important, prevents error for multiple requests
    }

    // Create event in DB

    const expense = await createExpense(
      request.body.expensename,
      request.body.cost,
      request.body.eventId,
      request.body.paymaster,
    );

    response.status(201).json({ expense: expense });
    return;
  } else if (request.method === 'DELETE') {
    if (typeof request.body.expenseId !== 'number' || !request.body.expenseId) {
      // 400 bad request
      response.status(400).json({
        errors: [{ message: 'id or event name not provided' }],
      });
      return; // Important, prevents error for multiple requests
    }
    const user = await getUserByValidSessionToken(request.cookies.sessionToken);
    console.log(user);
    if (!user) {
      response.status(401).json({
        errors: [{ message: 'Unothorized' }],
      });
      return;
    }

    const deletedExpense = await deleteExpenseById(request.body.expenseId);

    if (!deletedExpense) {
      response.status(404).json({ errors: [{ message: 'Name not provided' }] });
      return;
    }
    response.status(201).json({ expense: deletedExpense });
    return;
  }

  response.status(405).json({ errors: [{ message: 'Method not supported' }] });
}
