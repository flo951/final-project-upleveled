import { config } from 'dotenv-safe';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

config();
// type CreateEmailRequestBody = {
//   name: string;
//   message: string;
//   result: string[];
//   email: string;
//   expenseList: string[];
//   mailData: {
//     from: string;
//     to: string;
//     subject: string;
//     text: string;
//     html: string;
//   };
// };

// type SentEmail = {
//   from?: string;
//   to?: string;
//   subject?: string;
//   text?: string;
//   html?: string;
//   myAccessToken?: Promise<GetAccessTokenResponse>;
//   user?: string;
//   auth?: {
//     user: string;
//     refreshToken: string | undefined;
//     accessToken: Promise<GetAccessTokenResponse> | undefined;
//   };
// };

// export type CreateEmailResponseBody = {
//   errors?: { message: string }[];
//   name?: string;
//   message?: string;
//   result?: string[];
//   email?: string;
//   mailData?: SentEmail;
// };

// type CreateEventNextApiRequest = Omit<NextApiRequest, 'body'> & {
//   body: CreateEmailRequestBody;
// };

export default async function createEmailHandler(request, response) {
  if (request.method === 'POST') {
    if (
      typeof request.body.name !== 'string' ||
      !request.body.name ||
      typeof request.body.email !== 'string' ||
      !request.body.email ||
      typeof request.body.message !== 'string' ||
      !request.body.message
    ) {
      // 400 bad request
      response.status(400).json({
        errors: [{ message: 'Something went wrong' }],
      });
      return; // Important, prevents error for multiple requests
    }

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const refreshToken = process.env.REFRESH_TOKEN;

    const myOAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground',
    );

    myOAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    const myAccessToken = myOAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',

      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        clientId: clientId,
        clientSecret: clientSecret,
      },
    });
    // SentMessageInfo is type directly from nodemailer dependency
    const mailData = await transporter.sendMail({
      from: 'expensesplitterbot@gmail.com',
      to: request.body.email,
      subject: `Message From ${request.body.name} regarding an Expense on Splitify`,
      text: request.body.message,
      html: `<h3>New Message from Splitify was sent from: ${request.body.name} to you</h3>
      <div>${request.body.message}</div>
      <div>
      <h3>Results for Event ${request.body.event.eventname} </h3>
      Expense List: <p>${request.body.expenseList}</p>
      Result: <p>${request.body.result}</p>

      <a href="https://splitify-final-project.herokuapp.com/">
            Create your own Account on Splitify
          </a>
          </div>`,
      auth: {
        user: 'expensesplitterbot@gmail.com',
        refreshToken: refreshToken,
        accessToken: myAccessToken,
      },
    });
    response.status(200).json({ mailData: mailData });
    return;
  }

  response.status(405).json({ errors: [{ message: 'Method not supported' }] });
}
