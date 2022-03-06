import { NextApiRequest, NextApiResponse } from 'next';
import {
  createPerson,
  deletePersonById,
  Person,
  User,
} from '../../util/database';

export type CreatePersonResponseBody =
  | { errors: { message: string }[] }
  | { person: Person }
  | { personId: number };

export type CreatePersonRequestBody = {
  name: string;
  user: User;
  personId: number;
};

type CreatePersonNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: CreatePersonRequestBody;
};

export default async function createPersonHandler(
  request: CreatePersonNextApiRequest,
  response: NextApiResponse<CreatePersonResponseBody>,
) {
  console.log(request.query);
  if (request.method === 'POST') {
    if (
      typeof request.body.name !== 'string' ||
      !request.body.name ||
      typeof request.body.user.username !== 'string' ||
      !request.body.user.username
    ) {
      // 400 bad request
      response.status(400).json({
        errors: [{ message: 'Name not provided' }],
      });
      return; // Important, prevents error for multiple requests
    }

    // Create person in DB

    const person = await createPerson(request.body.name, request.body.user.id);

    response.status(201).json({ person: person });
    return;
  } else if (request.method === 'DELETE') {
    // if the method is DELETE delete the person matching the id and user_id
    const deletedGuest = await deletePersonById(
      request.body.personId,
      request.body.user.id,
    );

    if (!deletedGuest) {
      response.status(404).json({ errors: [{ message: 'Name not provided' }] });
      return;
    }
    response.status(201).json({ person: deletedGuest });
    return;
  }
  response.status(405).json({ errors: [{ message: 'Method not supported' }] });
}
