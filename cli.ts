import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.4/command/mod.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

await new Command().name("blog-cli").command(
  "today",
  "Create today's blog templates.",
).action(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.on("load", async () => {
  });
  await page.goto("https://leetcode.com/problemset/", {
    waitUntil: "networkidle2",
  });
  const { title, difficulty, link } = await page.evaluate(() => ({
    title: document.querySelector(
      "div[role='rowgroup'] div[role='cell']:nth-child(2)",
    )?.textContent ?? "???",
    difficulty: document.querySelector(
      "div[role='rowgroup'] div[role='cell']:nth-child(5)",
    )?.textContent ?? "???",
    link: document.querySelector(
      "div[role='rowgroup'] div[role='cell']:nth-child(2) a",
    )?.textContent ?? "#",
  }));
  await browser.close();
  let icon = "❓";
  switch (icon) {
    case "Easy":
      icon = "🟢";
      break;
    case "Medium":
      icon = "🟡";
      break;
    case "Hard":
      icon = "🔴";
      break;
  }
}).parse(Deno.args);
