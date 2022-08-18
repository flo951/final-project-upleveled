import { getCarData } from '../../util/database';

export default async function createAppHandler(request, response) {
  if (request.method === 'POST') {
    console.log(request.body.username)
    if(typeof request.body.username === "string") {
        // const userData = {
        //     username: request.body.username,
        //     carAssigned: "vw",
        //    carPool: [
        //     { label: "W-92345", value: "toyota", previousMileage: "12345" }, 
        //     { label: "W-82345", value: "bmw", previousMileage: "12345" },
        //     { label: "W-02345", value: "nissan", previousMileage: "12345"},
        //     { label: "W-12345", value: "aston martin", previousMileage: "12345"  },
        //     { label: "W-22345", value: "ferrari", previousMileage: "12345" },
        //     { label: "W-32345", value: "lamborghini", previousMileage: "12345" },
        //     { label: "W-52345", value: "mercedes", previousMileage: "12345" },
        //     { label: "W-42345", value: "vw", previousMileage: "12345" },
        //   ],
    
    
        // }

        const userData = await getCarData(request.body.username, request.body.password);
        console.log(userData)
       response.status(200).json({ userData: userData });
        return;
    }
    

    
  }

  response.status(405).json({ errors: [{ message: 'Method not supported' }] });
}
