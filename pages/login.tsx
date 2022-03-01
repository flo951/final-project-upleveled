import { css } from '@emotion/react';
import Head from 'next/head';
import { Router } from 'next/router';
import { formContainerStyles, formStyles } from '../styles/styles';

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

export default function Login() {
  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="signup" content="" />
      </Head>

      <div css={formContainerStyles}>
        <h1>Welcome</h1>
        <span css={spanLabelStyles}>Login to start your journey</span>
        <form css={formStyles}>
          <label htmlFor="e-mail">
            <span css={spanLabelStyles}>E-Mail</span>
          </label>
          <input
            css={nameInputStyles}
            type="email"
            data-test-id="signup-email"
            placeholder="Enter your E-Mail"
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
            placeholder="Password"
            required
          />
          <input
            css={inputSubmitStyles}
            data-test-id="complete-login"
            type="submit"
            value="Login"
          />
        </form>
      </div>
    </>
  );
}
