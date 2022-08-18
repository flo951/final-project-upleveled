

export default function createAppHandler(request, response) {
  if (request.method === 'POST') {
    
    

    const userData = {
        username: request.body.username,
        carAssigned: "BMW-X6",
       carPool: [
        { label: "Toyota", value: "toyota", plate: "W-92345" },
        { label: "BMW", value: "bmw", plate: "W-82345" },
        { label: "Nissan", value: "nissan", plate: "W-02345" },
        { label: "Aston Martin", value: "aston martin", plate: "W-12345" },
        { label: "Ferrari", value: "ferrari", plate: "W-22345" },
        { label: "Lamborghini", value: "lamborghini", plate: "W-32345" },
        { label: "Mercedes", value: "mercedes", plate: "W-52345" },
        { label: "VW", value: "vw", plate: "W-42345" },
      ],


    }

   response.status(200).json({ userData: userData });
    return;
  }

  response.status(405).json({ errors: [{ message: 'Method not supported' }] });
}
