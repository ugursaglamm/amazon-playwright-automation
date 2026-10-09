import { expect, type Locator, type Page } from '@playwright/test';
import { parsePrice } from '../utils/price';

export class CartPage {
  readonly page: Page;
  readonly items: Locator;
  readonly subtotal: Locator;
  readonly cartCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.items = page.locator('[data-name="Active Items"] [data-asin]');
    this.subtotal = page.locator('#sc-subtotal-amount-buybox');
    this.cartCount = page.locator('#nav-cart-count');
  }

  async verifyIsOpened(): Promise<void> {
    await expect(this.items.first(), 'Cart should list at least one item').toBeVisible();
  }

  async getTotalPrice(): Promise<number> {
    await expect(this.subtotal).toBeVisible();
    return parsePrice(await this.subtotal.innerText());
  }

  /** The cart row of the product with the given ASIN. */
  item(asin: string): Locator {
    return this.items.and(this.page.locator(`[data-asin="${asin}"]`));
  }

  itemQuantity(asin: string): Locator {
    return this.item(asin).locator('[data-a-selector="value"]');
  }

  /** Full (non-truncated) product title of a cart row. */
  async getItemTitle(asin: string): Promise<string> {
    const title = await this.item(asin).locator('.a-truncate-full').first().textContent();
    return (title ?? '').trim();
  }
}
