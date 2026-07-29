const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to admin page...');
  await page.goto('http://localhost:3001/admin/certifications', { waitUntil: 'networkidle0' });

  console.log('Typing into date field...');
  // Find the date input
  const dateInput = await page.$('input[type="date"]');
  if (dateInput) {
    await dateInput.click();
    await dateInput.type('05192025');
    
    // Evaluate the value
    const val = await page.evaluate(el => el.value, dateInput);
    console.log('Final Date Input Value:', val);
  } else {
    console.log('Date input not found');
  }

  await browser.close();
})();
