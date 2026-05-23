import { test, expect } from '@playwright/test';

test.describe('Recruitment App E2E Workflow', () => {
  
  test.beforeEach(async ({ page }) => {
    // 1. Mock the Firebase REST API auth call to prevent external network requirements
    await page.route(
      '**/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=*', 
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            localId: 'test-local-id',
            email: 'recruiter@example.com',
            displayName: 'Test Recruiter',
            idToken: 'mock-id-token',
            registered: true,
            refreshToken: 'mock-refresh-token',
            expiresIn: '3600'
          }),
        });
      }
    );
  });

  test('should log in successfully, navigate the Shell and verify AI Telemetry page components', async ({ page }) => {
    // 2. Go to the login page
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);
    
    // Check for credentials form inputs
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Type mock credentials
    await emailInput.fill('recruiter@example.com');
    await passwordInput.fill('password123');

    // Click Sign In button
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    
    // We click and wait for the natural redirect to happen once NextAuth completes
    await submitBtn.click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 20000 });
    
    // Verify that the navigation shell is rendered
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    
    // Verify navigation sidebar entries exist
    await expect(sidebar.locator('text=Dashboard')).toBeVisible();
    await expect(sidebar.locator('text=Jobs')).toBeVisible();
    await expect(sidebar.locator('text=Candidates')).toBeVisible();
    await expect(sidebar.locator('text=AI Telemetry')).toBeVisible();
    
    // 3. Navigate directly to the AI Telemetry dashboard
    await page.goto('/ai-performance');
    
    // Verify dashboard metrics are rendered
    await expect(page.locator('text=AI performance & error dashboard')).toBeVisible();
    await expect(page.locator('text=Total AI Requests')).toBeVisible();
    await expect(page.locator('text=Average Latency')).toBeVisible();
    
    // Verify interactive sandbox exists
    await expect(page.locator('text=Sentry Integration sandbox')).toBeVisible();
  });
});
