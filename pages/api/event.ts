import { NextApiRequest, NextApiResponse } from 'next';
import { createEvent, Event, User } from '../../util/database';

export type CreateEventResponseBody =
  | { errors: { message: string }[] }
  | { event: Event };

type CreateEventRequestBody = {
  eventname: string;
  user: User;
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
      typeof request.body.eventname !== 'string' ||
      !request.body.eventname ||
      typeof request.body.user.username !== 'string' ||
      !request.body.user.username
    ) {
      console.log(request.body);
      // 400 bad request
      response.status(400).json({
        errors: [{ message: 'Eventname not provided' }],
      });
      return; // Important, prevents error for multiple requests
    }

    // Create event in DB

    const event = await createEvent(
      request.body.eventname,
      request.body.user.id,
    );

    response.status(201).json({ event: event });
    return;
  }

  response.status(405).json({ errors: [{ message: 'Method not supported' }] });
}
