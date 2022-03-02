import { css } from '@emotion/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { formContainerStyles, formStyles } from '../styles/styles';

const nameInputStyles = css`
  padding: 8px 8px;
  font-size: 24px;

  border-radius: 4px;
  :focus {
    outline-color: #2a6592;
    outline-width: 2px;
    outline-style: solid;
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

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>([]);
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Registration</title>
        <meta name="Registration" content="Register on this page" />
      </Head>

      <div css={formContainerStyles}>
        <h1>Sign Up for Splitify </h1>
        <span>its free, for now...</span>
        <form
          css={formStyles}
          onSubmit={async (e) => {
            e.preventDefault();

            const registerResponse = await fetch('/api/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: username,
                password: password,
              }),
            });

            const registerResponseBody = await registerResponse.json();

            if ('errors' in registerResponseBody) {
              setErrors(registerResponseBody.errors);
              return;
            }

            await router.push('./login').catch((error) => console.log(error));
          }}
        >
          <label htmlFor="first-name">
            <span css={spanLabelStyles}>Username</span>
          </label>
          <input
            css={nameInputStyles}
            data-test-id="signup-first-name"
            id="first-name"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            placeholder="First Name"
            required
          />
          <label htmlFor="password">
            <span css={spanLabelStyles}>Password</span>
          </label>
          <input
            css={nameInputStyles}
            data-test-id="login-password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Password"
            required
          />
          <input
            css={inputSubmitStyles}
            data-test-id="complete-signup"
            type="submit"
            value="Sign Up Now"
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
