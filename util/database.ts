import postgres from 'postgres';
import camelcaseKeys from 'camelcase-keys';
import { config } from 'dotenv-safe';

config();

declare module globalThis {
  let postgresSqlClient: ReturnType<typeof postgres> | undefined;
}

function connectOneTimeToDatabase() {
  let sql;

  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    // sql = postgres();
    // Heroku needs SSL connections but
    // has an "unauthorized" certificate
    // https://devcenter.heroku.com/changelog-items/852
    sql = postgres({ ssl: { rejectUnauthorized: false } });
  } else {
    if (!globalThis.postgresSqlClient) {
      globalThis.postgresSqlClient = postgres();
    }
    sql = globalThis.postgresSqlClient;
  }
  return sql;
}

// connect to database
const sql = connectOneTimeToDatabase();

export type User = {
  id: number;
  username: string;
};

export type UserWithPasswordHash = User & { passwordHash: string };

export async function getUserById(id: number) {
  const [user] = await sql<[User | undefined]>`
    SELECT id, username FROM users WHERE id = ${id}
 `;
  return user && camelcaseKeys(user);
}

export async function getUserByValidSessionToken(token: string | undefined) {
  if (!token) return undefined;
  const [user] = await sql<[User | undefined]>`
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
  const [user] = await sql<[{ id: number } | undefined]>`
    SELECT id FROM users WHERE username = ${username}
 `;
  return user && camelcaseKeys(user);
}
export async function getUserWithPasswordHashByUsername(username: string) {
  const [user] = await sql<[UserWithPasswordHash | undefined]>`
    SELECT id, username, password_hash FROM users WHERE username = ${username}
 `;
  return user && camelcaseKeys(user);
}

export async function createUser(username: string, passwordHash: string) {
  const [user] = await sql<[User]>`

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
  const [session] = await sql<[Session | undefined]>`
    SELECT * FROM sessions WHERE token = ${token} AND expiry_timestamp > now()
 `;
  await deleteExpiredSessions();
  return session && camelcaseKeys(session);
}

export async function getValidSessionById(userId: number) {
  if (!userId) return undefined;
  const [session] = await sql<[Session | undefined]>`
    SELECT * FROM sessions WHERE user_id = ${userId} AND expiry_timestamp > now()
 `;
  await deleteExpiredSessions();
  return session && camelcaseKeys(session);
}

export async function createSession(token: string, userId: number) {
  const [session] = await sql<[Session]>`

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
  const [session] = await sql<[Session | undefined]>`

  DELETE FROM
  sessions
  WHERE
  token = ${token}
  RETURNING *
  `;

  return session && camelcaseKeys(session);
}

export async function deleteExpiredSessions() {
  const sessions = await sql<Session[]>`

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
  userId?: number;
};

// connect person to user that created it
export async function createPerson(personName: string, userId: number) {
  const [person] = await sql<[Person]>`

  INSERT INTO people
  (name, user_id)
  VALUES
  (${personName}, ${userId})
  RETURNING *
  `;

  return camelcaseKeys(person);
}

export async function deletePersonById(id: number, userId: number) {
  const [person] = await sql<[Person | undefined]>`
    DELETE FROM
      people
    WHERE
      id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  return person && camelcaseKeys(person);
}

export async function getAllPeopleWhereIdMatches(userId: number) {
  if (!userId) return undefined;
  const people = await sql<[Person][]>`
  SELECT id, name FROM people WHERE user_id = ${userId};


`;
  return people;
}

export type Event = {
  id: number;
  eventname: string;
};

export async function createEvent(eventName: string, userId: number) {
  const [event] = await sql<[Event]>`

  INSERT INTO events
  (eventname, user_id)
  VALUES
  (${eventName}, ${userId})
  RETURNING *
  `;

  return camelcaseKeys(event);
}
export async function getAllEventsWhereIdMatches(userId: number) {
  if (!userId) return undefined;
  const events = await sql<[Event][]>`
  SELECT eventname FROM events WHERE user_id = ${userId};


`;
  return events;
}
