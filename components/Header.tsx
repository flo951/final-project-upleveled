import Link from 'next/link';
import { css, Interpolation, Theme } from '@emotion/react';
import { User } from '../util/database';
import { AnchorHTMLAttributes } from 'react';

const headerStyles = css`
  padding: 12px 12px;
  margin: 12px;
  border-radius: 8px;
  background-color: #2a6592;
  border: 2px solid black;
  color: white;

  h3 {
    margin: 4px;
    padding: 8px;
    font-size: 20px;
    max-height: 42px;
    border: 2px solid #dc8409;
    border-radius: 8px;
  }

  a {
    color: white;
    text-decoration: none;
    margin: 4px;
    font-size: 20px;
    padding: 8px;
    max-height: 42px;
    max-width: max-content;
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
      background-color: #dc8409;
      transform-origin: bottom right;
      transition: transform 0.3s ease-out;
    }

    :hover:after {
      transform: scaleX(1);
      transform-origin: bottom left;
    }
  }
  @media only screen and (max-width: 800px) {
    width: 324px;
    margin: 12px auto;
  }
`;

const flexContainerStyles = css`
  display: flex;
  flex-direction: column;
  h3 {
    font-weight: 400;
  }
`;
const flexRowHeaderStyles = css`
  display: flex;
  justify-content: space-between;
`;

type Props = {
  userObject?: User;
};

function Anchor({
  children,
  ...restProps
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  css?: Interpolation<Theme>;
}) {
  return <a {...restProps}>{children}</a>;
}

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
              <a>Create New Event</a>
            </Link>
          </div>
          <div css={flexContainerStyles}>
            <h3>
              Hi{' '}
              <span data-test-id="logged-in-user">
                {props.userObject.username}
              </span>
            </h3>
            <Anchor data-test-id="logout" href="/logout">
              Logout
            </Anchor>
          </div>
        </div>
      ) : (
        <div css={flexRowHeaderStyles}>
          <Link href="/">
            <a>Splitify</a>
          </Link>
          <Link href="/register">
            <a data-test-id="sign-up">Sign Up</a>
          </Link>
          <Link href="/login">
            <a data-test-id="login">Login</a>
          </Link>
        </div>
      )}
    </header>
  );
}
