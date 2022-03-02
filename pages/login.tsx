import { css } from '@emotion/react';
import Head from 'next/head';
import { Router, useRouter } from 'next/router';
import { useState } from 'react';
import { formContainerStyles, formStyles } from '../styles/styles';
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

export default function Login() {
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
              }),
            });

            const loginResponseBody =
              (await loginResponse.json()) as LoginResponseBody;

            if ('errors' in loginResponseBody) {
              setErrors(loginResponseBody.errors);
              return;
            }
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
            setErrors([]); // maybe not necessary with redirect
            await router
              .push(`/users/${loginResponseBody.user.id}`)
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
