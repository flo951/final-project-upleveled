# Splitify - Expense Splitter Responsive Web App build with Next.Js


Responsive Web Application to split up expenses from different events equally among all participants. The App calculates who owes how much to whom, and shows statistics who paid for what. In the end you can send the results with a form to a E-Mail recipient. The App has a full Authentication and Authorization process, a user only has access after registering and logging in with an account.

Technologies used: Next.js, React.js, TypeScript, PostgreSQL, css/emotion,  Cloudinary to upload profile images, Chart.js Library to display charts, bcrypt Library for hashing data, nodemailer & GMAIL-API (0Auth2) to send data via E-Mail, Jest for Unit tests, Jest-Puppeteer for E2E Tests



## Dependencies

Next
Typescript
PostgreSQL
Postgres.js
@emotion/css
JS Cookie
dotenv-safe
ley
bcrypt
cloudinary
chart.js
nodemailer
googleapis
Jest
Jest-Puppeteer


## Setup

Clone the repo from GitHub and then install the dependencies:
```
git clone https://github.com/flo951/final-project-upleveled
cd final-project-upleveled
yarn
```
Setup a database with postgres on your computer:
```
psql <login>
CREATE DATABASE <database name>;
CREATE USER <username> WITH ENCRYPTED PASSWORD '<pw>';
GRANT ALL PRIVILEGES ON DATABASE <database name> TO <user name>;
```
Create a .env file with the userinfo for the database and create .env.example as a template file for userinfo

Use migrations:
```
yarn migrate up
```
To delete data from database run:
```
yarn migrate down
```
To run the development server:
```
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To create the production build of the project run:
```
yarn build
yarn start
```
## Deployment

To deploy this project, create a [Heroku Account](https://signup.heroku.com/) and follow the instructions

## Project Preview

![Example Image 1](/public/images/eventpic1.png)
![Example Image 2](/public/images/eventpic2.png)
![Example Image 3](/public/images/eventpic3.png)




