const baseUrl = 'http://localhost:3000';

test('Login and create event', async () => {
  await page.goto(`${baseUrl}/`);
  await expect(page).toMatch('Welcome to Splitify');
  await expect(page).toClick('[data-test-id="login"]');
  await page.waitForNavigation();
  expect(page.url()).toBe(`${baseUrl}/login`);
  await expect(page).toFill('[data-test-id="login-username"]', 'e2etest');
  await expect(page).toFill('[data-test-id="login-password"]', '1234');
  await expect(page).toClick('[data-test-id="complete-login"]');
  await expect(page).toMatchElement('[data-test-id="logged-in-user"]', {
    text: 'e2etest',
  });
  await page.goto(`${baseUrl}/createevent`);
  await expect(page).toFill('[data-test-id="create-event"]', 'EventTest');
  await expect(page).toClick('[data-test-id="complete-create-event"]');
  await expect(page).toMatchElement('[data-test-id="event-EventTest"]');
  await expect(page).toClick('[data-test-id="event-EventTest"]');
  await page.waitForNavigation();
  await expect(page).toMatchElement('[data-test-id="event-EventTest"]', {
    text: 'EventTest',
  });
  await expect(page).toFill('[data-test-id="create-person"]', 'Luigi');
  await expect(page).toClick('[data-test-id="complete-create-person"]');
  await expect(page).toMatchElement('[data-test-id="name-Luigi"]', {
    text: 'Luigi',
  });
  await expect(page).toFill('[data-test-id="create-person"]', 'Mario');
  await expect(page).toClick('[data-test-id="complete-create-person"]');
  await expect(page).toMatchElement('[data-test-id="name-Mario"]', {
    text: 'Mario',
  });
  await page.select('[data-test-id="select-person"]', '45');
  await expect(page).toFill('[data-test-id="expense-value"]', '300');
  await expect(page).toFill('[data-test-id="expense-name"]', 'Brownies');
  await expect(page).toClick('[data-test-id="complete-expense"]');
  await expect(page).toMatchElement('[data-test-id="expense-value-name"]', {
    text: 'Brownies 300€ paid by Luigi',
  });
  await page.select('[data-test-id="select-person"]', '46');
  await expect(page).toFill('[data-test-id="expense-value"]', '600');
  await expect(page).toFill('[data-test-id="expense-name"]', 'Fruits');
  await expect(page).toClick('[data-test-id="complete-expense"]');
  await expect(page).toMatchElement('[data-test-id="expense-value-name"]', {
    text: 'Fruits 600€ paid by Mario',
  });
  await expect(page).toClick('[data-test-id="logout"]');
  // await expect(page).toClick('[data-test-id="cart-link"]');
  // await page.waitForNavigation();
  // // go to cart page
  // expect(page.url()).toBe(`${baseUrl}/cart`);
  // await expect(page).toClick('[data-test-id="cart-product-remove-1"]');
  // await expect(page).toMatchElement('[data-test-id="cart-count"]', {
  //   text: '0',
  // });
});

// test('Checkout flow', async () => {
//   await page.goto(`${baseUrl}/`);
//   await expect(page).toMatch('Available Pokemon Cards');
//   expect(page.url()).toBe(`${baseUrl}/`);
//   await expect(page).toClick('[data-test-id="cart-link"]');
//   await page.waitForNavigation();
//   expect(page.url()).toBe(`${baseUrl}/cart`);
//   await expect(page).toClick('[data-test-id="cart-checkout"]');
//   await page.waitForNavigation();
//   expect(page.url()).toBe(`${baseUrl}/checkout`);
//   await expect(page).toFill('[data-test-id="checkout-first-name"]', 'Flo');
//   await expect(page).toFill('[data-test-id="checkout-last-name"]', 'Görlich');
//   await expect(page).toFill(
//     '[data-test-id="checkout-email"]',
//     'flo@upleveled.com',
//   );
//   await expect(page).toFill('[data-test-id="checkout-address"]', 'Wald');
//   await expect(page).toFill('[data-test-id="checkout-city"]', 'Vienna');
//   await expect(page).toFill('[data-test-id="checkout-postal-code"]', '1140');
//   await expect(page).toFill('[data-test-id="checkout-country"]', 'Austria');
//   await expect(page).toFill(
//     '[data-test-id="checkout-credit-card"]',
//     '1234567891234567',
//   );
//   await expect(page).toFill(
//     '[data-test-id="checkout-expiration-date"]',
//     '02/22',
//   );
//   await expect(page).toFill('[data-test-id="checkout-security-code"]', '123');
//   await expect(page).toClick('[data-test-id="checkout-confirm-order"]');
//   await page.waitForNavigation();
//   expect(page.url()).toBe(`${baseUrl}/thanks`);
//   await expect(page).toMatch('Thank you for your order');
// });
