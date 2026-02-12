import { test, expect } from '@playwright/test';

/**
 * E2E Test: User Registration Flow
 * 
 * This test verifies the complete user registration journey:
 * 1. Navigate to registration page
 * 2. Fill out registration form with valid data
 * 3. Submit form and wait for processing
 * 4. Verify redirect to home page after successful registration
 * 5. Verify user is logged in by checking UI elements
 * 6. Capture screenshot of success state
 */

test.describe('User Registration', () => {
  // Generate unique test user for each run to avoid conflicts
  const timestamp = Date.now();
  const testUser = {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'password123'
  };

  test('should successfully register a new user and redirect to home page', async ({ page }) => {
    console.log('[E2E Test] Starting user registration test');
    console.log('[E2E Test] Test user:', { name: testUser.name, email: testUser.email });

    // Step 1: Navigate to registration page
    console.log('[E2E Test] Navigating to registration page...');
    await page.goto('http://localhost:5173/register');
    
    // Verify we're on the registration page
    await expect(page).toHaveURL('http://localhost:5173/register');
    await expect(page).toHaveTitle('Team Task Manager');
    console.log('[E2E Test] Registration page loaded successfully');

    // Verify registration form elements are present
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Full Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email Address' })).toBeVisible();
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();
    console.log('[E2E Test] All form elements verified');

    // Step 2: Fill registration form
    console.log('[E2E Test] Filling registration form...');
    await page.getByRole('textbox', { name: 'Full Name' }).fill(testUser.name);
    await page.getByRole('textbox', { name: 'Email Address' }).fill(testUser.email);
    
    // Password fields need special handling
    const passwordFields = await page.getByPlaceholder('••••••••').all();
    await passwordFields[0].fill(testUser.password); // Password field
    await passwordFields[1].fill(testUser.password); // Confirm Password field
    
    console.log('[E2E Test] Form filled with test data');

    // Verify form values are set correctly
    await expect(page.getByRole('textbox', { name: 'Full Name' })).toHaveValue(testUser.name);
    await expect(page.getByRole('textbox', { name: 'Email Address' })).toHaveValue(testUser.email);

    // Step 3: Submit form
    console.log('[E2E Test] Submitting registration form...');
    const createAccountButton = page.getByRole('button', { name: 'Create Account' });
    await createAccountButton.click();
    
    // Verify button shows loading state
    await expect(page.getByRole('button', { name: /Creating account/i })).toBeVisible();
    console.log('[E2E Test] Form submission initiated, loading state confirmed');

    // Step 4: Verify redirect to home page
    console.log('[E2E Test] Waiting for redirect...');
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 });
    await expect(page).toHaveURL('http://localhost:5173/');
    console.log('[E2E Test] Successfully redirected to home page');

    // Step 5: Verify user is logged in
    console.log('[E2E Test] Verifying user authentication state...');
    
    // Check for welcome message with user name
    await expect(page.getByText(new RegExp(`Welcome back, ${testUser.name}`))).toBeVisible();
    console.log('[E2E Test] Welcome message verified');
    
    // Check for user email in header
    await expect(page.getByText(testUser.email)).toBeVisible();
    console.log('[E2E Test] User email displayed in header');
    
    // Check for logout button (indicates user is authenticated)
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    console.log('[E2E Test] Logout button present - user is authenticated');
    
    // Check for authenticated user features
    await expect(page.getByRole('button', { name: 'New Team' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create New Task/i })).toBeVisible();
    console.log('[E2E Test] Authenticated user features verified');

    // Step 6: Take screenshot of success state
    console.log('[E2E Test] Capturing success state screenshot...');
    await page.screenshot({ 
      path: 'frontend/tests/e2e/screenshots/registration-success.png',
      fullPage: true 
    });
    console.log('[E2E Test] Screenshot saved');

    console.log('[E2E Test] User registration test completed successfully');
  });

  test('should show validation error for password mismatch', async ({ page }) => {
    console.log('[E2E Test] Testing password mismatch validation');
    
    await page.goto('http://localhost:5173/register');
    
    // Fill form with mismatched passwords
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email Address' }).fill('test@example.com');
    
    const passwordFields = await page.getByPlaceholder('••••••••').all();
    await passwordFields[0].fill('password123');
    await passwordFields[1].fill('differentpassword');
    
    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Verify error message appears
    await expect(page.getByText('Passwords do not match')).toBeVisible();
    console.log('[E2E Test] Password mismatch validation working correctly');
  });

  test('should show validation error for short password', async ({ page }) => {
    console.log('[E2E Test] Testing short password validation');
    
    await page.goto('http://localhost:5173/register');
    
    // Fill form with short password
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email Address' }).fill('test@example.com');
    
    const passwordFields = await page.getByPlaceholder('••••••••').all();
    await passwordFields[0].fill('short');
    await passwordFields[1].fill('short');
    
    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Verify error message appears
    await expect(page.getByText('Password must be at least 8 characters long')).toBeVisible();
    console.log('[E2E Test] Short password validation working correctly');
  });

  test('should show validation error for invalid email', async ({ page }) => {
    console.log('[E2E Test] Testing invalid email validation');
    
    await page.goto('http://localhost:5173/register');
    
    // Fill form with invalid email
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email Address' }).fill('notanemail');
    
    const passwordFields = await page.getByPlaceholder('••••••••').all();
    await passwordFields[0].fill('password123');
    await passwordFields[1].fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Verify error message appears
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
    console.log('[E2E Test] Invalid email validation working correctly');
  });

  test('should navigate to login page when clicking sign in link', async ({ page }) => {
    console.log('[E2E Test] Testing navigation to login page');
    
    await page.goto('http://localhost:5173/register');
    
    // Click the "Sign in here" link
    await page.getByRole('link', { name: 'Sign in here' }).click();
    
    // Verify we're redirected to login page
    await page.waitForURL('http://localhost:5173/login');
    await expect(page).toHaveURL('http://localhost:5173/login');
    console.log('[E2E Test] Navigation to login page successful');
  });
});
