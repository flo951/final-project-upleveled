import { css } from '@emotion/react';
import Head from 'next/head';
import Router from 'next/router';
import { formContainerStyles, formStyles } from '../styles/styles';

const nameInputStyles = css`
  padding: 8px 8px;
  font-size: 24px;

  border-radius: 4px;
  :focus {
    outline-color: blue;
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

export default function SignUp() {
  return (
    <>
      <Head>
        <title>Registration</title>
        <meta name="signup" content="" />
      </Head>

      <div css={formContainerStyles}>
        <h1>Sign Up for Splitify </h1>
        <span>its free, for now...</span>
        <form
          css={formStyles}
          onSubmit={(event) => {
            event.preventDefault();
            Router.push('./login').catch((error) => console.log(error));
          }}
        >
          <label htmlFor="first-name">
            <span css={spanLabelStyles}>Username</span>
          </label>
          <input
            css={nameInputStyles}
            data-test-id="signup-first-name"
            id="first-name"
            name="first-name"
            placeholder="First Name"
            required
          />
          <input
            css={nameInputStyles}
            data-test-id="login-password"
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            required
          />
          <label htmlFor="e-mail">
            <span css={spanLabelStyles}>Last Name</span>
          </label>
          <input
            css={nameInputStyles}
            type="email"
            data-test-id="signup-email"
            placeholder="Enter your E-Mail"
            required
          />
          <input
            css={inputSubmitStyles}
            data-test-id="complete-signup"
            type="submit"
            value="Sign Up Now"
          />
        </form>
      </div>
    </>
  );
}
