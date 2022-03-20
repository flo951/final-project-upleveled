import { NextApiRequest, NextApiResponse } from 'next';
import {
  createEvent,
  deleteEventById,
  Event,
  insertImageUrlEvent,
  User,
} from '../../util/database';

type Url = {
  eventname: string;
  id: number;
  imageurl: string;
  userId: number;
};

export type CreateEventResponseBody =
  | { errors: { message: string }[] }
  | { event: Event }
  | { imageurl: Url };

export type DeleteEventResponseBody =
  | { errors: { message: string }[] }
  | { event: Event };

type CreateEventRequestBody = {
  eventname: string;
  user: User;
  eventId?: number;
  uploadUrl: string;
};

type CreateEventNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: CreateEventRequestBody;
};

export default async function createEventHandler(
  request: CreateEventNextApiRequest,
  response: NextApiResponse<CreateEventResponseBody>,
) {
  if (request.method === 'POST') {
    if (typeof request.body.uploadUrl !== 'undefined') {
      if (typeof request.body.eventId !== 'number' || !request.body.eventId) {
        // 400 bad request
        response.status(400).json({
          errors: [{ message: 'Oops something went wrong' }],
        });
        return; // Important, prevents error for multiple requests
      }

      const imgUrl: Url = await insertImageUrlEvent(
        request.body.uploadUrl,
        request.body.eventId,
      );

      response.status(201).json({ imageurl: imgUrl });
      return;
    }
    if (
      typeof request.body.eventname !== 'string' ||
      !request.body.eventname ||
      typeof request.body.user.username !== 'string' ||
      !request.body.user.username ||
      typeof request.body.user.id !== 'number' ||
      !request.body.user.id
    ) {
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
