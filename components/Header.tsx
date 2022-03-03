import Link from 'next/link';
import { css } from '@emotion/react';
import { User } from '../util/database';

const headerStyles = css`
  padding: 12px 12px;
  margin: 1rem 1rem;
  border-radius: 8px;
  background-color: #2a6592;

  border: 2px solid black;
  color: white;

  h3 {
    margin: 4px;
    padding: 8px;
  }

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
const flexRowHeaderStyles = css`
  display: flex;
  justify-content: space-between;
`;

type Props = {
  userObject?: User;
};

export default function Header(props: Props) {
  return (
    <header css={headerStyles}>
      {props.userObject ? (
        <div css={flexRowHeaderStyles}>
          <div css={flexContainerStyles}>
            <Link href="/users/protected">
              <a>Dashboard</a>
            </Link>
            <Link href="/createevent">
              <a>Create Event</a>
            </Link>
          </div>
          <div css={flexContainerStyles}>
            <h3>Hi {props.userObject.username}</h3>
            <a href="/logout">Logout</a>
          </div>
        </div>
      ) : (
        <div css={flexRowHeaderStyles}>
          <Link href="/">
            <a>Splitify</a>
          </Link>
          <Link href="/register">
            <a>Sign Up</a>
          </Link>
          <Link href="/login">
            <a>Login</a>
          </Link>
        </div>
      )}
    </header>
  );
}
