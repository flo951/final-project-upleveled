import camelcaseKeys from 'camelcase-keys';
import { config } from 'dotenv-safe';
import postgres from 'postgres';
import { sql, db } from '@vercel/postgres';

config();
const client = await db.connect();

declare module globalThis {
  let postgresSqlClient: ReturnType<typeof postgres> | undefined;
}

export type User = {
  id: number;
  username: string;
};

export type UserWithPasswordHash = User & { passwordHash: string };

export async function getUserById(id: number) {
  const user = await client.sql<[User | undefined]>`
    SELECT id, username FROM users WHERE id = ${id}
 `;
  return user && camelcaseKeys(user);
}

export async function getUserByValidSessionToken(token: string | undefined) {
  if (!token) return undefined;
  const user = await sql<[User | undefined]>`
  SELECT users.id ,
  users.username
   FROM users,
   sessions WHERE sessions.token = ${token}
    AND sessions.user_id = users.id
     AND expiry_timestamp > now()



  `;
  return user && camelcaseKeys(user);
}

export async function getUserByUsername(username: string) {
  const user = await client.sql<[{ id: number } | undefined]>`
    SELECT id FROM users WHERE username = ${username}
 `;
  return user && camelcaseKeys(user);
}
export async function getUserWithPasswordHashByUsername(username: string) {
  const user = await client.sql<[UserWithPasswordHash | undefined]>`
    SELECT id, username, password_hash FROM users WHERE username = ${username}
 `;
  return user && camelcaseKeys(user);
}

export async function createUser(username: string, passwordHash: string) {
  const user = await client.sql<[User]>`

  INSERT INTO users
  (username, password_hash)
  VALUES
  (${username}, ${passwordHash})
  RETURNING id, username
  `;

  return camelcaseKeys(user);
}
type Session = {
  id: number;
  token: string;
  userId: number;
};
export async function getValidSessionByToken(token: string) {
  if (!token) return undefined;
  const session = await client.sql<[Session | undefined]>`
    SELECT * FROM sessions WHERE token = ${token} AND expiry_timestamp > now()
 `;
  await deleteExpiredSessions();
  return session && camelcaseKeys(session);
}

export async function getValidSessionById(userId: number) {
  if (!userId) return undefined;
  const session = await client.sql<[Session | undefined]>`
    SELECT * FROM sessions WHERE user_id = ${userId} AND expiry_timestamp > now()
 `;
  await deleteExpiredSessions();
  return session && camelcaseKeys(session);
}

export async function createSession(token: string, userId: number) {
  const session = await client.sql<[Session]>`

  INSERT INTO sessions
  (token, user_id)
  VALUES
  (${token}, ${userId})
  RETURNING id, token
  `;
  await deleteExpiredSessions();
  return camelcaseKeys(session);
}

export async function deleteSessionByToken(token: string) {
  if (!token) return undefined;
  const session = await client.sql<[Session | undefined]>`

  DELETE FROM
  sessions
  WHERE
  token = ${token}
  RETURNING *
  `;

  return session && camelcaseKeys(session);
}

export async function deleteExpiredSessions() {
  const sessions = await client.sql<Session[]>`

  DELETE FROM
  sessions
  WHERE
  expiry_timestamp < NOW()
  RETURNING *
  `;

  return sessions.map((session: Session) => camelcaseKeys(session));
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
  const person = await client.sql<[Person]>`

  INSERT INTO people
  (name, event_id, user_id)
  VALUES
  (${personName}, ${eventId}, ${userId})
  RETURNING *
  `;

  return camelcaseKeys(person);
}

export async function deletePersonById(id: number, userId: number) {
  const person = await client.sql<[Person | undefined]>`
    DELETE FROM
      people
    WHERE
      id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  return person && camelcaseKeys(person);
}

export async function getAllPeopleWhereEventIdMatches(eventId: number) {
  const people = await client.sql`
  SELECT id, name, event_id
  FROM people
  WHERE event_id = ${eventId}

`;
  return people.map((person: Person) => camelcaseKeys(person));
}

export type Event = {
  id: number;
  eventname: string;
  userId: number;
  imageurl: string;
};

export async function createEvent(eventName: string, userId: number) {
  const event = await client.sql<[Event]>`

  INSERT INTO events
  (eventname, user_id)
  VALUES
  (${eventName}, ${userId})
  RETURNING *
  `;

  return camelcaseKeys(event);
}
export async function insertImageUrlEvent(imageUrl: string, eventId: number) {
  const event = await client.sql<[Event]>`

  UPDATE
      events
    SET
      imageurl = ${imageUrl}

    WHERE
      id = ${eventId}
    RETURNING *
  `;

  return camelcaseKeys(event);
}

export async function getProfileImageEvent(eventId: number) {
  const event = await client.sql<[Event]>`

  SELECT imageurl from events WHERE id = ${eventId}
  `;

  return camelcaseKeys(event);
}

export async function deleteEventById(id: number, userId: number) {
  const event = await client.sql<[Event | undefined]>`
    DELETE FROM
      events
    WHERE
      id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  return event && camelcaseKeys(event);
}
export async function getAllEventsWhereIdMatches(userId: number) {
  if (!userId) return undefined;
  const events = await client.sql<[Event][]>`
  SELECT id, eventname, imageurl FROM events WHERE user_id = ${userId};


`;
  return events;
}

export async function getSingleEvent(eventId: number) {
  const event = await client.sql<[Event]>`

  SELECT * from events WHERE id = ${eventId};
  `;

  return camelcaseKeys(event);
}

export type Expense = {
  id: number;
  expensename: string;
  personExpense: number;
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
  const expense = await client.sql<[Expense]>`

  INSERT INTO expenses
  (expensename, cost, event_id, paymaster)
  VALUES
  (${expenseName},${cost}, ${eventId}, ${paymaster})
  RETURNING *
  `;

  return camelcaseKeys(expense);
}

export async function deleteExpenseById(expenseId: number) {
  const expense = await client.sql<[Expense | undefined]>`
    DELETE FROM
     expenses
    WHERE
      id = ${expenseId}
    RETURNING *
  `;
  return expense && camelcaseKeys(expense);
}

export async function getAllExpensesWhereIdMatches(eventId: number) {
  const expenses = await client.sql<Expense[]>`
  SELECT * FROM
  expenses
  WHERE
  event_id = ${eventId}
`;
  return expenses.map((expense: Expense) => camelcaseKeys(expense));
}

export type CarData = {
  id: number;
  username: string;
  password: string;
  value: string;
  label: string;

  previousmileage: string;
};

export async function getCarData(username: string, password: string) {
  const carData = await client.sql<[CarData]>`
  SELECT * FROM
  etsweb
  WHERE
  username = ${username} AND password = ${password}
  `;
  return carData;
}
