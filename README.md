# cypress-mx-report - Multiple Cypress runs combined into a single Mochawesome report file

Cypress Dashboard is cool, but if your project is on a budget and you outrun the
free plan boundaries, you might need to look for alternative Cypress report
options. One solution with potential is Mochawesome, which provides tools
(Mochawesome-Merge, Mochawesome-Report-Generator) to merge Cypress test results
into as JSON file and generate a HTML report from it. These three tools require
some custom code to have the screenshots and videos embedded into the report.
This custom code is provided by this module. Furthermore, the implementation
allows you to merge multiple Cypress runs into a single report and having
screenshots and videos for all of these runs embedded.

## Install

```bash
npm install @bfoese/cypress-mx-report --save-dev
```

## How to use

First, you should have Cypress and Mochawesome installed.

### Register the plugin as new Cypress plugin

Your project should have a Cypress plugins file: `cypress/plugins/plugin.ts`. If
you do not have this file setup, read the offical Cypress guide first, which
explains how to integrate Cypress plugins:
https://docs.cypress.io/guides/tooling/plugins-guide#Installing-plugins


This is how you register this module as a new Cypress plugin:
```bash
# cypress/plugins/plugin.ts

import * as cyMxReport from '@bfoese/cypress-mx-report/dist/plugin';

module.exports = (on: any, config: unknown) => {
  const modifiedConfig = cyMxReport.CypressMxReportPlugin.register(config);
  // other plugins
  return modifiedConfig;
};
```
cypress-mx-report will slightly modify the Cypress config. It is important that
you return this modified config as shown above, otherwise it won't be applied.

### Include screenshots and videos in your Mochawesome report

Your project should have a Cypress support file: `cypress/support/index.ts`.

In order to have screenshots and/or videos embedded into your Mochawesome report, your need to add the following code.

This is how you register this module as a new Cypress plugin:
```bash
# cypress/support/index.ts

import { CypressMxReport } from '@bfoese/cypress-mx-report/dist/support';

# for screenshots add this line
CypressMxReport.includeScreenshots(Cypress);

# for videos add this line
CypressMxReport.includeVideos(Cypress);
```
