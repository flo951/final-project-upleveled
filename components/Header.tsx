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
    margin: 5px;
    font-size: 36px;
    padding: 8px;

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
  gap: 2rem;
`;

export default function Header() {
  return (
    <header css={headerStyles}>
      <Link href="/">
        <a>Splitify</a>
      </Link>
      <div css={flexContainerStyles}>
        <Link href="/signup">
          <a>Sign Up</a>
        </Link>
      </div>
    </header>
  );
}
