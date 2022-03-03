import Head from 'next/head';
import { useState } from 'react';

export default function CreateEvent() {
  const [personName, setPersonName] = useState('');
  return (
    <>
      <Head>
        <title>Events</title>
        <meta name="Create New Events" content="" />
      </Head>

      <div>
        <h1>Create a new Event</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <label htmlFor="e-mail">
            <span>Event Name</span>
          </label>
          <input
            data-test-id="username-login"
            placeholder="Event Name"
            onChange={(e) => setPersonName(e.currentTarget.value)}
            required
          />

          <input
            data-test-id="complete-create-event"
            type="submit"
            value="Create"
          />
        </form>
      </div>
    </>
  );
}

// insert persons into table in getserversideprops
