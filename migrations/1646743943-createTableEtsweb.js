exports.up = async (sql) => {
	await sql`
	   CREATE TABLE etsweb (
		   id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
		   username varchar(30) NOT NULL UNIQUE,
		   password varchar(30) NOT NULL,
			
			label varchar(30) NOT NULL,
			value varchar(30) NOT NULL,
			previousmileage varchar(30) NOT NULL
		  
  
		   );
  `;
  };
  
  exports.down = async (sql) => {
	await sql`
	  DROP TABLE etsweb
	  `;
  };
  