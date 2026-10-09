import { test, expect } from '../../fixtures/pages';

const SEARCH_TERM = process.env.SEARCH_TERM ?? 'MacBook Pro';

test(`first "${SEARCH_TERM}" search result is added to cart with the correct price`, async ({
  page,
  homePage,
  searchResultsPage,
  productPage,
  cartPage,
}) => {
  let resultAsin = '';
  let productTitle = '';
  let productPrice = 0;

  await test.step('1. Visit amazon.com.tr and check the home page is opened', async () => {
    await homePage.open();
    await homePage.verifyIsOpened();
  });

  await test.step('2. Accept the cookies popup if it appears', async () => {
    await homePage.acceptCookiesIfPresent();
  });

  await test.step(`3. Search for "${SEARCH_TERM}"`, async () => {
    await homePage.search(SEARCH_TERM);
  });

  const firstResult = await test.step('4. Find the first element on the results page', async () => {
    const result = await searchResultsPage.getFirstResult();
    resultAsin = await searchResultsPage.getAsin(result);
    return result;
  });

  await test.step('5. Click the first element and open the product detail page', async () => {
    await searchResultsPage.openResult(firstResult);
    await productPage.verifyIsOpened();
    expect(await productPage.getAsin(), 'Detail page should belong to the clicked result').toBe(resultAsin);
  });

  await test.step('6. Save the product price from the detail page', async () => {
    productTitle = await productPage.getTitle();
    productPrice = await productPage.getPrice();
    console.log(`Product: ${productTitle}\nASIN: ${resultAsin}\nProduct price: ${productPrice}`);
    await test.info().attach('product-page', { body: await page.screenshot(), contentType: 'image/png' });
  });

  await test.step('7. Add the product to cart and navigate to the cart page', async () => {
    await productPage.addToCart();
    await productPage.goToCart();
    await cartPage.verifyIsOpened();
  });

  await test.step('8. Validate the cart total equals the product price', async () => {
    const cartTotal = await cartPage.getTotalPrice();
    console.log(`Cart total: ${cartTotal}`);
    await test.info().attach('cart-page', { body: await page.screenshot(), contentType: 'image/png' });
    expect(cartTotal, 'Cart total should equal the product price').toBe(productPrice);
  });

  await test.step('Extra: the cart contains exactly the selected product, once', async () => {
    // Soft assertions report every mismatch instead of stopping at the first one.
    await expect.soft(cartPage.items, 'Cart should contain a single line item').toHaveCount(1);
    await expect.soft(cartPage.item(resultAsin), 'Cart item should be the selected product').toBeVisible();
    await expect.soft(cartPage.itemQuantity(resultAsin), 'Quantity should be 1').toHaveText('1');
    await expect.soft(cartPage.cartCount, 'Header cart counter should be 1').toHaveText('1');
    expect.soft(await cartPage.getItemTitle(resultAsin), 'Cart item title should match the product title').toBe(
      productTitle,
    );
  });
});
