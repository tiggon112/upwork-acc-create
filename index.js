const fs = require("fs/promises");
const { faker } = require("@faker-js/faker");
const pt = require("puppeteer-extra");
const axios = require("axios");
require("dotenv").config();
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
pt.use(StealthPlugin());
const { WebClient } = require("@slack/web-api");

const token = process.env.token;
const channel = process.env.channel;
const web = new WebClient(token);

const domain = process.env.domain;
const country = process.env.country;

const first_names = [
  "Sean",
  "Patrick",
  "Michael",
  "Liam",
  "Conor",
  "Ryan",
  "Aiden",
  "Oisin",
  "Cillian",
  "Shane",
  "Fionn",
  "Brendan",
  "Eoin",
  "Declan",
  "Ronan",
  "Dermot",
  "Kevin",
  "Niall",
  "Darragh",
  "Cathal",
  "Rory",
  "Fergus",
  "Kieran",
  "Padraig",
  "Brian",
  "Finbar",
  "Aidan",
  "Colm",
  "Seamus",
  "Malachy",
  "Tadhg",
  "Cormac",
  "Ruairi",
  "Donal",
  "Eoghan",
];
const last_names = [
  "Murphy",
  "Kelly",
  "Walsh",
  "Smith",
  "Byrne",
  "Ryan",
  "Connor",
  "Reilly",
  "Doyle",
  "McCarthy",
  "Gallagher",
  "Doherty",
  "Kennedy",
  "Lynch",
  "Murray",
  "Quinn",
  "Moore",
  "McLoughlin",
  "Connolly",
  "Daly",
  "Wilson",
  "Dunne",
  "Brennan",
  "Burke",
  "Collins",
  "Campbell",
  "Clarke",
  "Johnston",
  "Hughes",
  "Fitzpatrick",
];

const getRandomElement = (arr) => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};

const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
pt.use(
  AdblockerPlugin({
    interceptResolutionPriority: 0, // const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer')
  })
);

const PASSWORD = "QWE@#$asd234";

const getRandomNumber = () => {
  return Math.floor(Math.random() * (999999 - 100000) + 100000);
};

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const signup = async (page, emailAddress) => {
  await page.waitForSelector(
    'div#onetrust-close-btn-container button[aria-label="Close"]'
  );
  await page.$eval(
    'div#onetrust-close-btn-container button[aria-label="Close"]',
    (el) => el.click()
  );

  await page.waitForSelector('[data-qa="work"]', { timeout: 300000 });
  await page.$eval('[data-qa="work"]', (el) => el.click());
  await page.$eval(`button[type="button"][data-qa="btn-apply"]`, (el) =>
    el.click()
  );

  await page.waitForSelector("#first-name-input");
  await page.type("#first-name-input", getRandomElement(first_names));
  await page.type("#last-name-input", getRandomElement(last_names));
  await page.type("#redesigned-input-email", emailAddress);
  await page.type("#password-input", PASSWORD);
  await delay(1000);
  await page.$eval("#checkbox-terms", (el) => el.click());
  await delay(500);
  await page.$eval("#button-submit-form", (el) => el.click());

  await delay(8000);
};

const checkConnect = async (page, emailAddress) => {
  await page.goto("https://www.upwork.com/nx/create-profile/", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector("ul.welcome-step1-list");
  await delay(1500);
  const listCount = await page.evaluate(() => {
    return Array.from(document.querySelector("ul.welcome-step1-list").children)
      .length;
  });
  if (listCount == 3) {
    try {
      const result = await web.chat.postMessage({
        channel: channel,
        text: `Success email registered: \`${emailAddress}\` Password: \`${PASSWORD}\``,
      });
      console.log(result);
      await fs.access("accounts.txt");
      await fs.appendFile("accounts.txt", emailAddress + "\n");
    } catch (err) {
      await fs.writeFile("accounts.txt", emailAddress + "\n");
      console.error(`Error accessing file: ${err}`);
    }
    return true;
  }
  return false;
};

const readMail = async (email, upwork) => {
  const hrefRegex =
    /href="(https:\/\/www\.upwork\.com\/nx\/signup\/verify-email\/token\/[^"]*)"/;
  let match = "",
    count = 0;
  let errorCount = 0;
  while (!match) {
    try {
      const resp = await axios.get("https://generator.email/inbox1/", {
        headers: {
          Cookie: `embx=${encodeURIComponent([email])};surl=${email
            .split("@")
            .reverse()
            .join("%2F")}`,
        },
      });
      match = resp.data.match(hrefRegex);
      count++;
      if (count > 8) {
        await upwork.$eval("#button-submit-form", (el) => el.click());

        await delay(8000);
        count = 0;
      }
    } catch (err) {
      console.log(err);
      await delay(5000);
      errorCount++;
      if (errorCount > 8) throw new Error(err);
    }
  }
  const url = match[1];
  return url;
};

(async () => {
  // const proxies = (await fs.readFile("proxies.txt")).toString();
  // const proxylist = proxies.split("\n");
  while (true) {
    // const proxy = getRandomProxy(proxylist);
    // const proxyServer = proxy.split(":")[0];
    // const proxyPort = proxy.split(":")[1];
    // const proxyUser = proxy.split(":")[2];
    // const proxyPassword = proxy.split(":")[3];
    const start = performance.now();
    const browser = await pt.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
      const etempMail = await browser.newPage();
      // await etempMail.authenticate({
      //   username: "luis",
      //   password: "montoya",
      // });
      await etempMail.goto("https://generator.email");
      let emailAddress = `${faker.person.firstName(
        "male"
      )}.${faker.person.lastName("male")}${getRandomNumber()}@${domain}`;
      // do {
      //   await delay(3000);
      //   await etempMail.waitForSelector("#email_id");
      //   const element = await etempMail.$("#email_id");
      //   emailAddress = await etempMail.evaluate(
      //     (el) => el.textContent,
      //     element
      //   );
      // } while (emailAddress == "");
      console.log(emailAddress);
      const upwork = await browser.newPage();
      await upwork.goto("https://www.upwork.com/nx/signup/?dest=home", {
        waitUntil: "domcontentloaded",
      });

      await signup(upwork, emailAddress);

      const verify_link = await readMail(emailAddress, upwork);
      await upwork.goto(verify_link, {
        waitUntil: "domcontentloaded",
      });

      await delay(5000);

      const hasConnect = await checkConnect(upwork, emailAddress);

      await browser.close();

      const end = performance.now();
      console.log(
        emailAddress +
          " => " +
          ((end - start) / 1e3).toFixed(2) +
          "s : " +
          hasConnect
      );
    } catch (err) {
      console.log(err);
      browser.close();
    } finally {
      await delay(60000 + Math.random() * 60000);
    }
  }
})();
