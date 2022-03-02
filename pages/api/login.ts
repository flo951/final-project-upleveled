import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { getUserWithPasswordHashByUsername, User } from '../../util/database';

type LoginRequestBody = {
  username: string;
  password: string;
};

type LoginNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: LoginRequestBody;
};

export type LoginResponseBody =
  | { errors: { message: string }[] }
  | { user: Pick<User, 'id'> };

export default async function loginHandler(
  request: LoginNextApiRequest,
  response: NextApiResponse<LoginResponseBody>,
) {
  if (request.method === 'POST') {
    if (
      typeof request.body.username !== 'string' ||
      !request.body.username ||
      typeof request.body.password !== 'string' ||
      !request.body.password
    ) {
      response.status(400).json({
        errors: [
          {
            message: 'Username or password not provided',
          },
        ],
      });
      return; // Important: will prevent "Headers already sent" error
    }

    const userWithPasswordHash = await getUserWithPasswordHashByUsername(
      request.body.username,
    );

    if (!userWithPasswordHash) {
      response.status(401).json({
        errors: [{ message: "Username or Password doesn't exist" }],
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      request.body.password,
      userWithPasswordHash.passwordHash,
    );

    if (!passwordMatches) {
      response.status(401).json({
        errors: [{ message: "Username or Password doesn't exist" }],
      });
      return;
    }
    // todo return created session in cookie
    // status code 201 means something was created
    response.status(201).json({ user: { id: userWithPasswordHash.id } });
    return;
  }

  response.status(405).json({ errors: [{ message: 'Method not supported' }] });
}
