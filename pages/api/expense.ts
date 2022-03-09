import { NextApiRequest, NextApiResponse } from 'next';
import { createExpense, Expense } from '../../util/database';

export type CreateEventResponseBody =
  | { errors: { message: string }[] }
  | { expense: Expense };

type CreateEventRequestBody = {
  expensename: string;
  cost: number;
  eventId: number;

  paymaster: number;
};

type CreateEventNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: CreateEventRequestBody;
};

export default async function createEventHandler(
  request: CreateEventNextApiRequest,
  response: NextApiResponse<CreateEventResponseBody>,
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
      console.log(request.body);
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
  }
  // } else if (request.method === 'DELETE') {
  //   console.log(request.body);
  //   if (
  //     typeof request.body.eventId !== 'number' ||
  //     !request.body.eventId ||
  //     typeof request.body.user.username !== 'string' ||
  //     !request.body.user.username
  //   ) {
  //     // 400 bad request
  //     response.status(400).json({
  //       errors: [{ message: 'id or event name not provided' }],
  //     });
  //     return; // Important, prevents error for multiple requests
  //   }
  //   // if the method is DELETE delete the person matching the id and user_id
  //   const deletedEvent = await deleteEventById(
  //     request.body.eventId,
  //     request.body.user.id,
  //   );

  //   if (!deletedEvent) {
  //     response.status(404).json({ errors: [{ message: 'Name not provided' }] });
  //     return;
  //   }
  //   response.status(201).json({ event: deletedEvent });
  //   return;
  // }

  response.status(405).json({ errors: [{ message: 'Method not supported' }] });
}
