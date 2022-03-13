exports.up = async (sql) => {
  await sql`
	 CREATE TABLE expenses (
	 	id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	 	expensename varchar(30) NOT NULL,
		cost integer,
		event_id integer REFERENCES events (id) ON DELETE CASCADE,
		paymaster integer

		 );
`;
};

exports.down = async (sql) => {
  await sql`
	DROP TABLE expenses
	`;
};
