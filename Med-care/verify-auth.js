const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const screenshotDir = 'C:\\Users\\ANTONIO\\AppData\\Local\\Temp\\verify-screenshots';
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Helper: clear localStorage to ensure fresh session
  async function freshPage() {
    const page = await context.newPage();
    await page.goto('http://localhost:5173/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await sleep(1000);
    return page;
  }

  const results = [];

  // Flow F: Navigate to /admin/dashboard without session → should redirect to /login
  console.log('=== Flow F: Protected route without session ===');
  {
    const page = await context.newPage();
    await page.goto('http://localhost:5173');
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5173/admin/dashboard');
    await sleep(1500);
    const url = page.url();
    const passed = url.includes('/login');
    results.push({ flow: 'F', label: 'Protected route → /login redirect', passed, url });
    console.log('URL after /admin/dashboard:', url, passed ? 'PASS' : 'FAIL');
    await page.screenshot({ path: path.join(screenshotDir, 'flow-F.png') });
    await page.close();
  }

  // Flow A: Valid credentials (admin) → /admin/dashboard
  console.log('=== Flow A: Valid admin login ===');
  {
    const page = await freshPage();
    await page.fill('input[type="email"]', 'admin.garcia@email.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.screenshot({ path: path.join(screenshotDir, 'flow-A-before.png') });
    await page.click('button[type="submit"]');
    await sleep(1500);
    const url = page.url();
    const passed = url.includes('/admin/dashboard');
    results.push({ flow: 'A', label: 'Admin login → /admin/dashboard', passed, url });
    console.log('URL after admin login:', url, passed ? 'PASS' : 'FAIL');
    await page.screenshot({ path: path.join(screenshotDir, 'flow-A-after.png') });
    await page.close();
  }

  // Flow B: mustChangePassword user → /login/change-password
  console.log('=== Flow B: mustChangePassword user ===');
  {
    const page = await freshPage();
    await page.fill('input[type="email"]', 'carlos.garcia@email.com');
    await page.fill('input[type="password"]', 'Temp2026!');
    await page.click('button[type="submit"]');
    await sleep(1500);
    const url = page.url();
    const passed = url.includes('/login/change-password');
    results.push({ flow: 'B', label: 'mustChangePassword → /login/change-password', passed, url });
    console.log('URL after carlos login:', url, passed ? 'PASS' : 'FAIL');
    await page.screenshot({ path: path.join(screenshotDir, 'flow-B.png') });
    await page.close();
  }

  // Flow C: Invalid credentials → inline error
  console.log('=== Flow C: Invalid credentials ===');
  {
    const page = await freshPage();
    await page.fill('input[type="email"]', 'admin.garcia@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await sleep(1500);
    const url = page.url();
    const pageContent = await page.content();
    const hasError = pageContent.includes('Credenciales incorrectas') || pageContent.includes('incorrectas');
    const stillOnLogin = url.includes('/login') && !url.includes('change-password');
    const passed = hasError && stillOnLogin;
    results.push({ flow: 'C', label: 'Invalid creds → inline error', passed, url, hasError });
    console.log('URL:', url, 'Has error:', hasError, passed ? 'PASS' : 'FAIL');
    await page.screenshot({ path: path.join(screenshotDir, 'flow-C.png') });
    await page.close();
  }

  // Flow D: Inactive account → accountDisabled error
  console.log('=== Flow D: Inactive account ===');
  {
    const page = await freshPage();
    await page.fill('input[type="email"]', 'admin.lopez@email.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await sleep(1500);
    const url = page.url();
    const pageContent = await page.content();
    const hasError = pageContent.includes('desactivada') || pageContent.includes('disabled');
    const stillOnLogin = url.includes('/login') && !url.includes('change-password');
    const passed = hasError && stillOnLogin;
    results.push({ flow: 'D', label: 'Inactive account → accountDisabled error', passed, url, hasError });
    console.log('URL:', url, 'Has error:', hasError, passed ? 'PASS' : 'FAIL');
    await page.screenshot({ path: path.join(screenshotDir, 'flow-D.png') });
    await page.close();
  }

  // Flow G: DevRoleSwitcher visible on login page
  console.log('=== Flow G: DevRoleSwitcher visible ===');
  {
    const page = await freshPage();
    const content = await page.content();
    const hasDevSwitcher = content.includes('Dev') || content.includes('Seleccionar usuario') || content.includes('Select user');
    const passed = hasDevSwitcher;
    results.push({ flow: 'G', label: 'DevRoleSwitcher visible in dev mode', passed });
    console.log('Has DevRoleSwitcher:', hasDevSwitcher, passed ? 'PASS' : 'FAIL');
    await page.screenshot({ path: path.join(screenshotDir, 'flow-G.png') });
    await page.close();
  }

  // Flow G2: DevRoleSwitcher autocompletes form
  console.log('=== Flow G2: DevRoleSwitcher autocomplete ===');
  {
    const page = await freshPage();
    // Try to interact with the Select component
    try {
      const selectTrigger = await page.$('[role="combobox"]');
      if (selectTrigger) {
        await selectTrigger.click();
        await sleep(500);
        const firstOption = await page.$('[role="option"]');
        if (firstOption) {
          await firstOption.click();
          await sleep(500);
          const emailValue = await page.$eval('input[type="email"]', el => el.value);
          const passwordInput = await page.$('input[id="password"]');
          const passwordValue = passwordInput ? await passwordInput.evaluate(el => el.value) : '';
          const passed = emailValue.length > 0 && passwordValue.length > 0;
          results.push({ flow: 'G2', label: 'DevRoleSwitcher autocompletes email+password', passed, emailValue });
          console.log('Email after select:', emailValue, 'Password filled:', passwordValue.length > 0, passed ? 'PASS' : 'FAIL');
        } else {
          results.push({ flow: 'G2', label: 'DevRoleSwitcher autocompletes email+password', passed: false, note: 'No options found' });
        }
      } else {
        results.push({ flow: 'G2', label: 'DevRoleSwitcher autocompletes email+password', passed: false, note: 'No combobox found' });
      }
    } catch(e) {
      results.push({ flow: 'G2', label: 'DevRoleSwitcher autocompletes', passed: false, note: e.message });
    }
    await page.screenshot({ path: path.join(screenshotDir, 'flow-G2.png') });
    await page.close();
  }

  await browser.close();

  console.log('\n=== SUMMARY ===');
  results.forEach(r => {
    console.log(`Flow ${r.flow}: ${r.passed ? 'PASS' : 'FAIL'} - ${r.label}`);
    if (r.url) console.log(`  URL: ${r.url}`);
  });

  const allPassed = results.every(r => r.passed);
  console.log('\nOverall:', allPassed ? 'ALL PASS' : 'SOME FAILED');
  process.exit(allPassed ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
