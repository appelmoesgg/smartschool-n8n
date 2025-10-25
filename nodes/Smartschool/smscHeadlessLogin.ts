import { chromium } from 'playwright';

export async function smscHeadlessLogin(creds: {
	domain: string;
	email: string;
	password: string;
	birthdate: string;
}) {
	const { domain, email, password, birthdate } = creds;

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({
		ignoreHTTPSErrors: true,
		userAgent: "Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.166 Safari/537.36"
	});
	const page = await context.newPage();

	// insta redirect to microsoft login boom big brain move they better do NOT change this url
	await page.goto(`https://${domain}/login/sso/init/office365`, { waitUntil: 'load' });


	await page.waitForURL('**login.microsoftonline.com**', { timeout: 20000 });

	// Email
	await page.fill('input[type="email"]', email);
	await page.click('input[type="submit"]');

	// Wait for password stage
	await page.waitForSelector('input[type="password"]', { timeout: 15000 });
	await page.fill('input[type="password"]', password);
	await page.click('input[type="submit"]');

	// don't stay signed in (we don't care, we'll just use email/pw again)
	try {
		await page.waitForSelector('input[id="idBtn_Back"]', { timeout: 5000 });
		await page.click('input[id="idBtn_Back"]');
	} catch (_) {}

	// wait for age verification page
	await page.waitForURL(`https://${domain}/account-verification`, { timeout: 30000 });

	await page.waitForSelector('input[type="date"]', { timeout: 15000 })
	await page.fill('input[type="date"]', birthdate);
	await page.click('button[type="submit"]');


	await page.waitForURL(`https://${domain}/*`, { timeout: 60000 });
	const cookies = await context.cookies();
	let phpSess: any = {};

	cookies.forEach(cookie => {
		if (cookie.name === 'PHPSESSID' && cookie.domain === domain) {
			phpSess = cookie;
		}
	});

	await browser.close();

	if (!phpSess) {
		throw new Error("❌ Login succeeded, but PHPSESSID cookie was not found.");
	}

	return {
		phpSessId: phpSess.value,
	};
}
