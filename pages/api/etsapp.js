

export default function createAppHandler(request, response) {
  if (request.method === 'POST') {
    console.log(request.body.username)
    if(request.body.username === "Rohrdorfer") {
        const userData = {
            username: request.body.username,
            carAssigned: "vw",
           carPool: [
            { label: "W-92345", value: "toyota" },
            { label: "W-82345", value: "bmw" },
            { label: "W-02345", value: "nissan"},
            { label: "W-12345", value: "aston martin"  },
            { label: "W-22345", value: "ferrari" },
            { label: "W-32345", value: "lamborghini" },
            { label: "W-52345", value: "mercedes" },
            { label: "W-42345", value: "vw" },
          ],
    
    
        }
        console.log(userData)
       response.status(200).json({ userData: userData });
        return;
    }
    

    
  }

  response.status(405).json({ errors: [{ message: 'Method not supported' }] });
}
