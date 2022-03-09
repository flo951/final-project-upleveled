exports.up = async (sql) => {
  await sql`
	 CREATE TABLE events (
	 	id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	 	eventname varchar(30) NOT NULL UNIQUE,
		 user_id integer REFERENCES users (id) ON DELETE CASCADE
		 );
`;
};

exports.down = async (sql) => {
  await sql`
	DROP TABLE events
	`;
};
