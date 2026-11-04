import { expect, type Locator, type Page } from '@playwright/test';
import { parsePrice } from '../utils/price';

export class ProductPage {
  readonly page: Page;
  readonly title: Locator;
  readonly asinInput: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly goToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('#productTitle').first();
    this.asinInput = page.locator('input#ASIN').first();
    this.price = page.locator('#corePriceDisplay_desktop_feature_div .priceToPay').first();
    // The page contains a hidden duplicate of this button, so only the visible one is targeted.
    this.addToCartButton = page.locator('#add-to-cart-button:visible');
    this.goToCartButton = page.locator('#sw-gtc');
  }

  async verifyIsOpened(): Promise<void> {
    await expect(this.title, 'Product title should be visible on the detail page').toBeVisible();
  }

  async getTitle(): Promise<string> {
    return (await this.title.innerText()).trim();
  }

  async getAsin(): Promise<string> {
    const asin = await this.asinInput.getAttribute('value');
    if (!asin) {
      throw new Error('Product detail page has no ASIN');
    }
    return asin;
  }

  async getPrice(): Promise<number> {
    await expect(
      this.price,
      'Product price should be displayed; the product may be unavailable',
    ).toBeVisible();
    return parsePrice(await this.price.innerText());
  }

  async addToCart(): Promise<void> {
    await expect(
      this.addToCartButton,
      '"Sepete ekle" button should exist; the product may be out of stock or sold only via other sellers',
    ).toBeVisible();
    await this.addToCartButton.click();
  }

  async goToCart(): Promise<void> {
    await this.goToCartButton.click();
    await this.page.waitForURL(/\/cart/);
  }
}
