import { css } from '@emotion/react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { formContainerStyles, formStyles } from '../styles/styles';
import { createCsrfToken } from '../util/auth';
import { getValidSessionByToken } from '../util/database';
import { LoginResponseBody } from './api/login';

const nameInputStyles = css`
  padding: 8px 8px;
  font-size: 24px;

  border-radius: 4px;
  :focus {
    transition: 0.3s ease-out;
  }
`;

const inputSubmitStyles = css`
  margin-top: 48px;
  padding: 8px 8px;
  background-color: #2a6592;
  color: white;
  border: 2px solid black;
  border-radius: 8px;
  font-size: 24px;
  width: 100%;
  cursor: pointer;
`;

const spanLabelStyles = css`
  font-size: 24px;
  margin-bottom: 12px;
`;
const errorStyles = css`
  color: red;
  font-size: 24px;
`;
type Errors = { message: string }[];

type Props = {
  refreshUserProfile: () => void;
  csrfToken: string;
};

export default function Login(props: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>([]);
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="login" content="" />
      </Head>

      <div css={formContainerStyles}>
        <h1>Welcome</h1>
        <span css={spanLabelStyles}>Login to start your journey</span>
        <form
          css={formStyles}
          onSubmit={async (e) => {
            e.preventDefault();

            const loginResponse = await fetch('/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: username,
                password: password,
                csrfToken: props.csrfToken,
              }),
            });

            const loginResponseBody =
              (await loginResponse.json()) as LoginResponseBody;

            if ('errors' in loginResponseBody) {
              setErrors(loginResponseBody.errors);
              return;
            }

            // get the query paramaeter from next.js router
            const returnTo = router.query.returnTo;
            console.log('returnTo', returnTo);

            if (
              returnTo &&
              !Array.isArray(returnTo) &&
              // match returnto paramater against valid path
              // regexpressions
              /^\/[a-zA-Z0-9-?=]*$/.test(returnTo)
            ) {
              await router.push(returnTo);
              return;
            }

            // clear errors
            // maybe not necessary with redirect setErrors([]);
            props.refreshUserProfile();
            await router
              .push(`/createevent`)
              .catch((error) => console.log(error));
          }}
        >
          <label htmlFor="e-mail">
            <span css={spanLabelStyles}>Username</span>
          </label>
          <input
            css={nameInputStyles}
            data-test-id="username-login"
            placeholder="Username"
            onChange={(e) => setUsername(e.currentTarget.value)}
            required
          />
          <label htmlFor="password">
            <span css={spanLabelStyles}>Password</span>
          </label>
          <input
            css={nameInputStyles}
            data-test-id="login-password"
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />
          <input
            css={inputSubmitStyles}
            data-test-id="complete-login"
            type="submit"
            value="Login"
          />
        </form>
        <div css={errorStyles}>
          {errors.map((error) => {
            return <div key={`error-${error.message}`}>{error.message}</div>;
          })}
        </div>
      </div>
    </>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Redirect from HTTP to HTTPS on Heroku
  if (
    context.req.headers.host &&
    context.req.headers['x-forwarded-proto'] &&
    context.req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return {
      redirect: {
        destination: `https://${context.req.headers.host}/login`,
        permanent: true,
      },
    };
  }
  // 1. check if there is a token and is valid from the cookie

  const token = context.req.cookies.sessionToken;
  // 2. if its valid redirect otherwise render the page
  if (token) {
    const session = await getValidSessionByToken(token);
    if (session) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
  }
  // 3. Otherwise, generate CSRF token and render the page

  return {
    props: {
      csrfToken: createCsrfToken(),
    },
  };
}
