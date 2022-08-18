

export default function createAppHandler(request, response) {
  if (request.method === 'POST') {
    
    

    const userData = {
        username: request.body.username,
        carAssigned: "BMW-X6",
       carPool: {car1: {type: "BMW-X6", plate: "W-12345"}, car2: {type: "BMW-X2", plate: "W-56473"}, car3: {type: "BMW-X2", plate: "W-22222"}, car4: {type: "BMW-X9", plate: "W-98765"}},


    }

   response.status(200).json({ userData: userData });
    return;
  }

  response.status(405).json({ errors: [{ message: 'Method not supported' }] });
}
