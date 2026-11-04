import { expect, type Locator, type Page } from '@playwright/test';

export class SearchResultsPage {
  readonly page: Page;
  readonly results: Locator;

  constructor(page: Page) {
    this.page = page;
    this.results = page.locator('[data-component-type="s-search-result"]'); // for not AdHolder: '[data-component-type="s-searchresult"]:not(.AdHolder)'
  }

  async getFirstResult(): Promise<Locator> {
    const firstResult = this.results.first();
    await expect(firstResult, 'At least one search result should be listed').toBeVisible();
    return firstResult;
  }

  /** ASIN is Amazon's unique product id; every result card carries it in "data-asin". */
  async getAsin(result: Locator): Promise<string> {
    const asin = await result.getAttribute('data-asin');
    if (!asin) {
      throw new Error('Search result has no data-asin attribute');
    }
    return asin;
  }

  /** Clicks the product title link of the given result and waits for the detail page. */
  async openResult(result: Locator): Promise<void> {
    await result.locator('a:has(h2)').first().click();
    await this.page.waitForURL(/\/dp\//);
  }
}
