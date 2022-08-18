const carPool = [
	{ label: "W-92345", value: "toyota", previousmileage: "12345", username: "florian.goerlich@enio.at", password: "123" }, 
	{ label: "W-82345", value: "bmw", previousmileage: "12345", username: "florian.goe@enio.at", password: "123" },
	{ label: "W-02345", value: "nissan", previousmileage: "12345", username: "flo@enio.at", password: "123"},
	{ label: "W-12345", value: "aston martin", previousmileage: "12345", username: "florian.@enio.at", password: "123"  },
	{ label: "W-22345", value: "ferrari", previousmileage: "12345", username: "florian.goerlich", password: "123" },
	{ label: "W-32345", value: "lamborghini", previousmileage: "12345", username: "flo", password: "123" },
	{ label: "W-52345", value: "mercedes", previousmileage: "12345", username: "at", password: "123" },
	{ label: "W-42345", value: "vw", previousmileage: "12345", username: "florian.goer", password: "123" },
  ]
  
  exports.up = async (sql) => {
	await sql`
	  INSERT INTO etsweb
	  ${sql(carPool, 'label', 'value', 'previousmileage', 'username', 'password')}
  `;
  };
  
  exports.down = async (sql) => {
	for (const car of carPool) {
	  await sql`
		  DELETE FROM etsweb WHERE
		  username = ${car.username}
			  `;
	}
  };