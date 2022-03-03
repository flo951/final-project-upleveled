exports.up = async (sql) => {
  await sql`
	 CREATE TABLE events (
	 	id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	 	eventname varchar(30) NOT NULL UNIQUE

		 );
`;
};

exports.down = async (sql) => {
  await sql`
	DROP TABLE events
	`;
};
