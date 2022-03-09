import { NextApiRequest, NextApiResponse } from 'next';
import { createEvent, deleteEventById, Event, User } from '../../util/database';

export type CreateEventResponseBody = {
  event?: Event;
  errors?: { message: string }[];
};

type CreateEventRequestBody = {
  eventname: string;
  user: User;
  eventId?: number;
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
  } else if (request.method === 'DELETE') {
    console.log(request.body);
    if (
      typeof request.body.eventId !== 'number' ||
      !request.body.eventId ||
      typeof request.body.user.username !== 'string' ||
      !request.body.user.username
    ) {
      // 400 bad request
      response.status(400).json({
        errors: [{ message: 'id or event name not provided' }],
      });
      return; // Important, prevents error for multiple requests
    }
    // if the method is DELETE delete the person matching the id and user_id
    const deletedEvent = await deleteEventById(
      request.body.eventId,
      request.body.user.id,
    );

    if (!deletedEvent) {
      response.status(404).json({ errors: [{ message: 'Name not provided' }] });
      return;
    }
    response.status(201).json({ event: deletedEvent });
    return;
  }

  response.status(405).json({ errors: [{ message: 'Method not supported' }] });
}
