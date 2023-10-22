import camelcaseKeys from 'camelcase-keys';
import { config } from 'dotenv-safe';
import { PrismaClient } from '@prisma/client';

config();
const prisma = new PrismaClient();

export type User = {
  id: number;
  username: string;
};

export type UserWithPasswordHash = User & { passwordHash: string };

export async function getUserById(id: number) {
  return await prisma.users.findUnique({
    where: {
      id: id,
    },
  });
}

export async function getUserByValidSessionToken(token: string | undefined) {
  if (!token) return undefined;
  // const user = await sql<User>`
  // SELECT users.id ,
  // users.username
  //  FROM users,
  //  sessions WHERE sessions.token = ${token}
  //   AND sessions.user_id = users.id
  //    AND expiry_timestamp > now()
  // `;
  // return camelcaseKeys(user.rows[0]);
  return await prisma.users.findFirst({
    where: {
      sessions: {
        some: {
          token: token,
          expiry_timestamp: {
            gt: new Date(),
          },
        },
      },
    },
    select: {
      id: true,
      username: true,
    },
  });
}

export async function getUserByUsername(username: string) {
  //   const user = await client.sql<{ id: number }>`
  //     SELECT id FROM users WHERE username = ${username}
  //  `;
  //   return camelcaseKeys(user.rows[0]);
  return await prisma.users.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
}
export async function getUserWithPasswordHashByUsername(username: string) {
  //   const user = await client.sql<UserWithPasswordHash>`
  //     SELECT id, username, password_hash FROM users WHERE username = ${username}
  //  `;
  //   return camelcaseKeys(user.rows[0]);
  return await prisma.users.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      password_hash: true,
    },
  });
}

export async function createUser(username: string, passwordHash: string) {
  // const user = await client.sql<User>`

  // INSERT INTO users
  // (username, password_hash)
  // VALUES
  // (${username}, ${passwordHash})
  // RETURNING id, username
  // `;

  // return camelcaseKeys(user.rows[0]);

  return await prisma.users.create({
    data: {
      username,
      password_hash: passwordHash,
    },
  });
}
type Session = {
  id: number;
  token: string;
  userId: number;
};
export async function getValidSessionByToken(token: string) {
  if (!token) return undefined;
  //   const session = await client.sql<Session>`
  //     SELECT * FROM sessions WHERE token = ${token} AND expiry_timestamp > now()
  //  `;
  const session = await prisma.sessions.findFirst({
    where: {
      token,
      expiry_timestamp: {
        gt: new Date(),
      },
    },
  });
  await deleteExpiredSessions();
  return session;
}

export async function getValidSessionById(userId: number) {
  if (!userId) return undefined;
  //   const session = await client.sql<Session>`
  //     SELECT * FROM sessions WHERE user_id = ${userId} AND expiry_timestamp > now()
  //  `;
  const session = await prisma.sessions.findFirst({
    where: {
      user_id: userId,
      expiry_timestamp: {
        gt: new Date(),
      },
    },
  });
  await deleteExpiredSessions();
  return session;
}

export async function createSession(token: string, userId: number) {
  // const session = await client.sql<Session>`

  // INSERT INTO sessions
  // (token, user_id)
  // VALUES
  // (${token}, ${userId})
  // RETURNING id, token
  // `;
  const session = await prisma.sessions.create({
    data: {
      token,
      user_id: userId,
    },
  });
  await deleteExpiredSessions();
  return session;
}

export async function deleteSessionByToken(token: string) {
  if (!token) return undefined;
  // const session = await client.sql<Session>`

  // DELETE FROM
  // sessions
  // WHERE
  // token = ${token}
  // RETURNING *
  // `;

  // return camelcaseKeys(session.rows[0]);
  return await prisma.sessions.delete({
    where: {
      token,
    },
  });
}

export async function deleteExpiredSessions() {
  // const sessions = await client.sql<Session>`

  // DELETE FROM
  // sessions
  // WHERE
  // expiry_timestamp < NOW()
  // RETURNING *
  // `;

  // return sessions.rows.map((session) => camelcaseKeys(session));
  return await prisma.sessions.deleteMany({
    where: {
      expiry_timestamp: {
        lt: new Date(),
      },
    },
  });
}

export type Person = {
  id: number;
  name: string;
  eventId?: number;
  userId?: number;
  person?: string;
};

// connect person to user that created it
export async function createPerson(
  personName: string,
  eventId: number,
  userId: number,
) {
  // const person = await client.sql<Person>`

  // INSERT INTO people
  // (name, event_id, user_id)
  // VALUES
  // (${personName}, ${eventId}, ${userId})
  // RETURNING *
  // `;
  // console.log('person', person);
  // return camelcaseKeys(person.rows[0]);
  return await prisma.people.create({
    data: {
      name: personName,
      event_id: eventId,
      user_id: userId,
    },
  });
}

export async function deletePersonById(id: number, userId: number) {
  // const person = await client.sql<Person>`
  //   DELETE FROM
  //     people
  //   WHERE
  //     id = ${id} AND user_id = ${userId}
  //   RETURNING *
  // `;
  // return camelcaseKeys(person.rows[0]);
  return await prisma.people.delete({
    where: {
      id,
      user_id: userId,
    },
  });
}

export async function getAllPeopleWhereEventIdMatches(eventId: number) {
  //   const people = await client.sql<Person>`
  //   SELECT id, name, event_id
  //   FROM people
  //   WHERE event_id = ${eventId}

  // `;
  //   return people.rows.map((person: Person) => camelcaseKeys(person));
  return await prisma.people.findMany({
    where: {
      event_id: eventId,
    },
    select: {
      id: true,
      name: true,
      event_id: true,
    },
  });
}

export type Event = {
  id: number;
  eventname: string;
  userId: number;
  imageurl: string;
};

export async function createEvent(eventName: string, userId: number) {
  // const event = await client.sql<Event>`

  // INSERT INTO events
  // (eventname, user_id)
  // VALUES
  // (${eventName}, ${userId})
  // RETURNING *
  // `;

  // return camelcaseKeys(event.rows[0]);
  return await prisma.events.create({
    data: {
      eventname: eventName,
      user_id: userId,
    },
  });
}
export async function insertImageUrlEvent(imageUrl: string, eventId: number) {
  // const event = await client.sql<Event>`

  // UPDATE
  //     events
  //   SET
  //     imageurl = ${imageUrl}

  //   WHERE
  //     id = ${eventId}
  //   RETURNING *
  // `;

  // return camelcaseKeys(event.rows[0]);
  return await prisma.events.update({
    where: {
      id: eventId,
    },
    data: {
      imageurl: imageUrl,
    },
  });
}

export async function getProfileImageEvent(eventId: number) {
  // const event = await client.sql<Event>`

  // SELECT imageurl from events WHERE id = ${eventId}
  // `;

  // return camelcaseKeys(event.rows[0]);
  return await prisma.events.findUnique({
    where: {
      id: eventId,
    },
    select: {
      imageurl: true,
    },
  });
}

export async function deleteEventById(id: number, userId: number) {
  // const event = await client.sql<Event>`
  //   DELETE FROM
  //     events
  //   WHERE
  //     id = ${id} AND user_id = ${userId}
  //   RETURNING *
  // `;
  // return camelcaseKeys(event.rows[0]);
  return await prisma.events.delete({
    where: {
      id,
      user_id: userId,
    },
  });
}
export async function getAllEventsWhereIdMatches(userId: number) {
  if (!userId) return undefined;
  // const events = await client.sql<Event>`
  // SELECT id, eventname, imageurl FROM events WHERE user_id = ${userId};
  // `;
  //   return events.rows;
  return await prisma.events.findMany({
    where: {
      user_id: userId,
    },
    select: {
      id: true,
      eventname: true,
      imageurl: true,
    },
  });
}

export async function getSingleEvent(eventId: number) {
  // const event = await client.sql<Event>`

  // SELECT * from events WHERE id = ${eventId};
  // `;

  // return camelcaseKeys(event.rows[0]);
  return await prisma.events.findUnique({
    where: {
      id: eventId,
    },
  });
}

export type Expense = {
  id: number;
  expensename: string;
  personExpense?: number;
  cost: number;
  eventId: number;
  paymaster: number;
};

export async function createExpense(
  expenseName: string,
  cost: number,

  eventId: number,
  paymaster: number,
) {
  // const expense = await client.sql<Expense>`

  // INSERT INTO expenses
  // (expensename, cost, event_id, paymaster)
  // VALUES
  // (${expenseName},${cost}, ${eventId}, ${paymaster})
  // RETURNING *
  // `;

  // return camelcaseKeys(expense.rows[0]);
  return await prisma.expenses.create({
    data: {
      expensename: expenseName,
      cost,
      event_id: eventId,
      paymaster,
    },
  });
}

export async function deleteExpenseById(expenseId: number) {
  // const expense = await client.sql<Expense>`
  //   DELETE FROM
  //    expenses
  //   WHERE
  //     id = ${expenseId}
  //   RETURNING *
  // `;
  // return camelcaseKeys(expense.rows[0]);
  return await prisma.expenses.delete({
    where: {
      id: expenseId,
    },
  });
}

export async function getAllExpensesWhereIdMatches(eventId: number) {
  const expenses = await prisma.expenses.findMany({
    where: {
      event_id: eventId,
    },
  });

  return expenses.map((expense) => camelcaseKeys(expense));
}
