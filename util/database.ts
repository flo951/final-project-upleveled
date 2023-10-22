import camelcaseKeys from 'camelcase-keys';
import { config } from 'dotenv-safe';
import { sql, db } from '@vercel/postgres';

config();
const client = await db.connect();

try {
  await sql`
	 CREATE TABLE IF NOT EXISTS users (
	 	id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	 	username varchar(30) NOT NULL UNIQUE,
		password_hash varchar(60) NOT NULL
		 );
`;
  await sql`
CREATE TABLE IF NOT EXISTS sessions (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  token varchar(90) NOT NULL UNIQUE,
 expiry_timestamp timestamp NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
 user_id integer REFERENCES users (id) ON DELETE CASCADE
  );
`;
  await sql`
CREATE TABLE IF NOT EXISTS events (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  eventname varchar(30) NOT NULL,
  imageurl varchar(120),
 user_id integer REFERENCES users (id) ON DELETE CASCADE
  );
`;
  await sql`
CREATE TABLE IF NOT EXISTS people (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name varchar(30) NOT NULL,
 event_id integer REFERENCES events (id) ON DELETE CASCADE,
 user_id integer REFERENCES users (id) ON DELETE CASCADE

  );
`;
  await sql`
CREATE TABLE IF NOT EXISTS expenses (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  expensename varchar(30) NOT NULL,
 cost integer,
 event_id integer REFERENCES events (id) ON DELETE CASCADE,
 paymaster integer REFERENCES people (id) ON DELETE CASCADE

  );
`;
} catch (error) {
  console.error('error creating tables', error);
}

export type User = {
  id: number;
  username: string;
};

export type UserWithPasswordHash = User & { passwordHash: string };

export async function getUserById(id: number) {
  const user = await client.sql<User>`
    SELECT id, username FROM users WHERE id = ${id}
 `;
  return camelcaseKeys(user.rows[0]);
}

export async function getUserByValidSessionToken(token: string | undefined) {
  if (!token) return undefined;
  const user = await sql<User>`
  SELECT users.id ,
  users.username
   FROM users,
   sessions WHERE sessions.token = ${token}
    AND sessions.user_id = users.id
     AND expiry_timestamp > now()



  `;
  return camelcaseKeys(user.rows[0]);
}

export async function getUserByUsername(username: string) {
  const user = await client.sql<{ id: number }>`
    SELECT id FROM users WHERE username = ${username}
 `;
  return camelcaseKeys(user.rows[0]);
}
export async function getUserWithPasswordHashByUsername(username: string) {
  const user = await client.sql<UserWithPasswordHash>`
    SELECT id, username, password_hash FROM users WHERE username = ${username}
 `;
  return camelcaseKeys(user.rows[0]);
}

export async function createUser(username: string, passwordHash: string) {
  const user = await client.sql<User>`

  INSERT INTO users
  (username, password_hash)
  VALUES
  (${username}, ${passwordHash})
  RETURNING id, username
  `;

  return camelcaseKeys(user.rows[0]);
}
type Session = {
  id: number;
  token: string;
  userId: number;
};
export async function getValidSessionByToken(token: string) {
  if (!token) return undefined;
  const session = await client.sql<Session>`
    SELECT * FROM sessions WHERE token = ${token} AND expiry_timestamp > now()
 `;
  await deleteExpiredSessions();
  return camelcaseKeys(session.rows[0]);
}

export async function getValidSessionById(userId: number) {
  if (!userId) return undefined;
  const session = await client.sql<Session>`
    SELECT * FROM sessions WHERE user_id = ${userId} AND expiry_timestamp > now()
 `;
  await deleteExpiredSessions();
  return camelcaseKeys(session.rows[0]);
}

export async function createSession(token: string, userId: number) {
  const session = await client.sql<Session>`

  INSERT INTO sessions
  (token, user_id)
  VALUES
  (${token}, ${userId})
  RETURNING id, token
  `;
  await deleteExpiredSessions();
  return camelcaseKeys(session.rows[0]);
}

export async function deleteSessionByToken(token: string) {
  if (!token) return undefined;
  const session = await client.sql<Session>`

  DELETE FROM
  sessions
  WHERE
  token = ${token}
  RETURNING *
  `;

  return camelcaseKeys(session.rows[0]);
}

export async function deleteExpiredSessions() {
  const sessions = await client.sql<Session>`

  DELETE FROM
  sessions
  WHERE
  expiry_timestamp < NOW()
  RETURNING *
  `;

  return sessions.rows.map((session) => camelcaseKeys(session));
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
  const person = await client.sql<Person>`

  INSERT INTO people
  (name, event_id, user_id)
  VALUES
  (${personName}, ${eventId}, ${userId})
  RETURNING *
  `;
  console.log('person', person);
  return camelcaseKeys(person.rows[0]);
}

export async function deletePersonById(id: number, userId: number) {
  const person = await client.sql<Person>`
    DELETE FROM
      people
    WHERE
      id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  return camelcaseKeys(person.rows[0]);
}

export async function getAllPeopleWhereEventIdMatches(eventId: number) {
  const people = await client.sql<Person>`
  SELECT id, name, event_id
  FROM people
  WHERE event_id = ${eventId}

`;
  return people.rows.map((person: Person) => camelcaseKeys(person));
}

export type Event = {
  id: number;
  eventname: string;
  userId: number;
  imageurl: string;
};

export async function createEvent(eventName: string, userId: number) {
  const event = await client.sql<Event>`

  INSERT INTO events
  (eventname, user_id)
  VALUES
  (${eventName}, ${userId})
  RETURNING *
  `;

  return camelcaseKeys(event.rows[0]);
}
export async function insertImageUrlEvent(imageUrl: string, eventId: number) {
  const event = await client.sql<Event>`

  UPDATE
      events
    SET
      imageurl = ${imageUrl}

    WHERE
      id = ${eventId}
    RETURNING *
  `;

  return camelcaseKeys(event.rows[0]);
}

export async function getProfileImageEvent(eventId: number) {
  const event = await client.sql<Event>`

  SELECT imageurl from events WHERE id = ${eventId}
  `;

  return camelcaseKeys(event.rows[0]);
}

export async function deleteEventById(id: number, userId: number) {
  const event = await client.sql<Event>`
    DELETE FROM
      events
    WHERE
      id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  return camelcaseKeys(event.rows[0]);
}
export async function getAllEventsWhereIdMatches(userId: number) {
  if (!userId) return undefined;
  const events = await client.sql<Event>`
  SELECT id, eventname, imageurl FROM events WHERE user_id = ${userId};


`;
  return events.rows;
}

export async function getSingleEvent(eventId: number) {
  const event = await client.sql<Event>`

  SELECT * from events WHERE id = ${eventId};
  `;

  return camelcaseKeys(event.rows[0]);
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
  const expense = await client.sql<Expense>`

  INSERT INTO expenses
  (expensename, cost, event_id, paymaster)
  VALUES
  (${expenseName},${cost}, ${eventId}, ${paymaster})
  RETURNING *
  `;

  return camelcaseKeys(expense.rows[0]);
}

export async function deleteExpenseById(expenseId: number) {
  const expense = await client.sql<Expense>`
    DELETE FROM
     expenses
    WHERE
      id = ${expenseId}
    RETURNING *
  `;
  return camelcaseKeys(expense.rows[0]);
}

export async function getAllExpensesWhereIdMatches(eventId: number) {
  const expenses = await client.sql<Expense>`
  SELECT * FROM
  expenses
  WHERE
  event_id = ${eventId}
`;
  return expenses.rows.map((expense) => camelcaseKeys(expense));
}
