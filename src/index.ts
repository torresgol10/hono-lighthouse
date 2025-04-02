import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from 'hono/logger'

import fs from "fs";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const app = new Hono();
app.use(logger())

app.get("/", async (c) => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = {
    //logLevel: "info",
    output: "json",
    onlyCategories: ["performance"],
    port: 9222
  };
  const runnerResult = await lighthouse("https://www.google.es/", options);

  // `.report` is the HTML report as a string
  fs.writeFileSync("new-path.webp", runnerResult.artifacts.FullPageScreenshot.screenshot.data.replace(/^data:image\/webp;base64,/, ''), 'base64');

  const reportHtml = runnerResult.report;
  fs.writeFileSync("lhreport2.html", reportHtml);

  // `.lhr` is the Lighthouse Result as a JS object
  console.log("Report is done for", runnerResult.lhr.finalDisplayedUrl);
  console.log(
    "Performance score was",
    runnerResult.lhr.categories.performance.score * 100
  );

  chrome.kill();

  //return c.html(runnerResult.report);
  return c.json(reportHtml);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
