import Link from 'next/link';
import { css } from '@emotion/react';

const headerStyles = css`
  padding: 12px 12px;
  margin: 1rem 1rem;
  border-radius: 8px;
  background-color: #2a6592;
  display: flex;
  justify-content: space-between;
  border: 2px solid black;

  a {
    color: white;
    text-decoration: none;
    margin: 4px;
    font-size: 24px;
    padding: 8px;
    max-height: 42px;
    display: inline-block;
    position: relative;

    :after {
      content: '';
      position: absolute;
      width: 100%;
      transform: scaleX(0);
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: white;
      transform-origin: bottom right;
      transition: transform 0.3s ease-out;
    }

    :hover:after {
      transform: scaleX(1);
      transform-origin: bottom left;
    }
  }
`;

const flexContainerStyles = css`
  display: flex;
  flex-direction: column;
`;

export default function Header(props) {
  console.log(props);
  return (
    <header css={headerStyles}>
      <div css={flexContainerStyles}>
        <Link href="/">
          <a>Splitify</a>
        </Link>
        <Link href="/logout">
          <a>Logout</a>
        </Link>
        <Link href="/users/protectedUser">
          <a>Protected User</a>
        </Link>
      </div>
      <div css={flexContainerStyles}>
        <Link href="/register">
          <a>Sign Up</a>
        </Link>
        <Link href="/login">
          <a>Login</a>
        </Link>
      </div>
      {props.userObject && <div>{props.userObject.username}</div>}
    </header>
  );
}
