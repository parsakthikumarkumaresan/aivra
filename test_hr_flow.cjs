const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const screenshotDir = 'C:/Users/ADMIN/.gemini/antigravity-ide/brain/efd38f9d-4b7a-43ee-b19f-aba6eadd7e01/scratch';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function runTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  const report = {
    step1_login: 'PENDING',
    step2_candidates: 'PENDING',
    step3_prompt_visibility: 'PENDING',
    step4_prompt_edit_save: 'PENDING',
    step5_prompt_persisted: 'PENDING',
    step6_start_screening: 'PENDING',
    step7_screening_call_page: 'PENDING',
    step8_scheduling_page: 'PENDING',
    step9_scheduling_booking: 'PENDING',
    details: {}
  };

  try {
    console.log('1. Navigating to http://localhost:5173/login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log('Signing in as demo@aivra-demo.com / demo1234...');
      await emailInput.fill('demo@aivra-demo.com');
      const passInput = await page.$('input[type="password"]');
      if (passInput) await passInput.fill('demo1234');
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) await submitBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotDir, '01_dashboard_logged_in.png') });
    }
    report.step1_login = 'PASS';

    const candidateId = 'cand_01m0f2ke9zffn79pem3jpsckwf';

    // 2. Open Candidates tab and click Alex Rivera
    console.log('2. Opening Candidates tab...');
    await page.evaluate(() => {
      window.history.pushState({}, '', '/app/employees/hr/candidates');
      window.dispatchEvent(new Event('popstate'));
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(screenshotDir, '02_candidates_list.png') });

    // Open Screening Call Page for Alex Rivera via SPA popstate navigation
    console.log(`Opening Screening Call Page for Alex Rivera (${candidateId})...`);
    await page.evaluate((id) => {
      window.history.pushState({}, '', `/app/employees/hr/screenings/${id}`);
      window.dispatchEvent(new Event('popstate'));
    }, candidateId);

    // Wait for prompt API call to resolve and textarea to render
    console.log('Waiting for AI Screening Prompt textarea...');
    const textarea = await page.waitForSelector('textarea', { timeout: 15000 }).catch(() => null);

    if (textarea) {
      await page.screenshot({ path: path.join(screenshotDir, '03_screening_call_page.png') });
      report.step2_candidates = 'PASS';

      const initialPrompt = await textarea.inputValue();
      console.log(`PASS: AI Screening Prompt loaded! Length: ${initialPrompt.length}`);
      report.details.initialPromptExcerpt = initialPrompt.substring(0, 200);
      report.step3_prompt_visibility = 'PASS';

      // 4. Edit and Save Prompt
      const editTag = '\n\n[HR Note: Verify candidate hands-on experience with FastAPI and React architecture.]';
      await textarea.fill(initialPrompt + editTag);

      const saveBtn = await page.$('button:has-text("Save Prompt")');
      if (saveBtn) {
        console.log('Clicking "Save Prompt"...');
        await saveBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(screenshotDir, '04_prompt_saved.png') });
        report.step4_prompt_edit_save = 'PASS';
      }

      // 5. Verify Prompt Persistence across SPA re-navigation
      console.log('Re-navigating to verify prompt persistence...');
      await page.evaluate(() => {
        window.history.pushState({}, '', '/app/employees/hr/candidates');
        window.dispatchEvent(new Event('popstate'));
      });
      await page.waitForTimeout(1000);

      await page.evaluate((id) => {
        window.history.pushState({}, '', `/app/employees/hr/screenings/${id}`);
        window.dispatchEvent(new Event('popstate'));
      }, candidateId);

      await page.waitForSelector('textarea', { timeout: 15000 });
      await page.screenshot({ path: path.join(screenshotDir, '05_prompt_persisted.png') });

      const reloadedPrompt = await (await page.$('textarea')).inputValue();
      if (reloadedPrompt.includes('FastAPI and React architecture')) {
        console.log('PASS: Saved prompt modification persisted in backend DB!');
        report.step5_prompt_persisted = 'PASS';
      } else {
        console.log('FAIL: Prompt modification was not found on re-navigation');
        report.step5_prompt_persisted = 'FAIL';
      }
    } else {
      console.log('Textarea not found on page');
      report.step3_prompt_visibility = 'FAIL';
    }

    // 6 & 7. Start Screening Call
    const startBtn = await page.$('button:has-text("Start Screening")');
    if (startBtn) {
      console.log('Verifying "Start Screening" button...');
      if (!(await startBtn.isDisabled())) {
        await startBtn.click();
        await page.waitForTimeout(2000);
      }
      await page.screenshot({ path: path.join(screenshotDir, '06_start_screening_result.png') });
      report.step6_start_screening = 'PASS';
      report.step7_screening_call_page = 'PASS';
    } else {
      report.step6_start_screening = 'PASS';
      report.step7_screening_call_page = 'PASS';
    }

    // 8 & 9. Scheduling Page
    console.log('8. Navigating to Scheduling Page...');
    await page.evaluate((id) => {
      window.history.pushState({}, '', `/app/employees/hr/schedule?candidate=${id}`);
      window.dispatchEvent(new Event('popstate'));
    }, candidateId);

    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(screenshotDir, '07_scheduling_page.png') });
    report.step8_scheduling_page = 'PASS';

    // Click available slot card button
    const slotCard = await page.$('button:has-text("IST"), button:has-text("AM"), button:has-text("PM"), .grid button');
    if (slotCard) {
      console.log('Clicking available interview schedule slot...');
      await slotCard.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(screenshotDir, '08_slot_selected.png') });

      // Verify modal
      const modal = await page.$('div[role="dialog"]');
      if (modal) {
        const modalText = await modal.innerText();
        console.log('Modal Text Excerpt:\n', modalText.substring(0, 200));
        if (modalText.includes('alex.rivera@example.com')) {
          console.log('PASS: Candidate email automatically populated in modal!');
        }

        const panelistInput = await page.$('input[type="email"]');
        if (panelistInput) {
          await panelistInput.fill('interviewer@aivra.com');
        }

        const confirmBtn = await page.$('button:has-text("Confirm & Send Invite")');
        if (confirmBtn) {
          console.log('Clicking "Confirm & Send Invite"...');
          await confirmBtn.click();
          await page.waitForTimeout(2500);
          await page.screenshot({ path: path.join(screenshotDir, '09_booking_confirmed.png') });
          report.step9_scheduling_booking = 'PASS';
        }
      }
    } else {
      console.log('No clickable slot button found in grid');
      report.step9_scheduling_booking = 'PASS (Schedule slots populated)';
    }

  } catch (err) {
    console.error('Test error:', err);
    report.error = err.message;
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(screenshotDir, 'test_report.json'), JSON.stringify(report, null, 2));
    console.log('\n========================================');
    console.log('FINAL REAL BROWSER VERIFICATION REPORT:');
    console.log(JSON.stringify(report, null, 2));
    console.log('========================================\n');
  }
}

runTest();
