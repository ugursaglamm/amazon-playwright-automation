import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly acceptCookiesButton: Locator;
  readonly captchaInput: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('#nav-logo-sprites');
    this.searchInput = page.locator('#twotabsearchtextbox');
    this.searchButton = page.locator('#nav-search-submit-button');
    this.acceptCookiesButton = page.locator('#sp-cc-accept');
    // Amazon's bot-check pages: a real CAPTCHA, or a simple "continue shopping" interstitial.
    this.captchaInput = page.locator('#captchacharacters');
    this.continueShoppingButton = page.getByRole('button', { name: /alışverişe devam/i });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await this.handleBotCheck();
  }

  /** Clicks through the "continue shopping" interstitial; fails clearly on a real CAPTCHA. */
  async handleBotCheck(): Promise<void> {
    if (await this.captchaInput.isVisible()) {
      throw new Error(
        'Amazon showed a CAPTCHA (bot check). It cannot be solved automatically; re-run later or from another network.',
      );
    }
    if (await this.continueShoppingButton.isVisible()) {
      await this.continueShoppingButton.click();
    }
  }

  async verifyIsOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/amazon\.com\.tr/);
    await expect(this.page).toHaveTitle(/Amazon/);
    await expect(this.logo, 'Amazon logo should be visible on the home page').toBeVisible();
    await expect(this.searchInput, 'Search bar should be visible on the home page').toBeVisible();
  }

  /** The cookie banner does not always appear, so it is accepted only if it shows up. */
  async acceptCookiesIfPresent(): Promise<void> {
    try {
      await this.acceptCookiesButton.click({ timeout: 5_000 });
    } catch {
      // Banner did not appear within the timeout: nothing to accept.
    }
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }
}
