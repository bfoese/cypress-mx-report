# cypress-mx-report - Multiple Cypress runs combined into a single Mochawesome report file

Cypress Dashboard is cool, but if your project is on a budget and you outrun the
free plan boundaries, you might need to look for alternative Cypress report
generators. <br/>
One customizable solution with potential is Mochawesome, which provides tools
(Mochawesome-Merge, Mochawesome-Report-Generator) to merge Cypress test results
into a JSON file and generate a HTML report from it. These tools even enable you
to generate a single report from multiple succeding test runs. But by default,
this report would not contain screenshots nor videos. You need some custom code
that hooks into the Mochawesome generator to attach screenshot/video links for
the report. This custom code is provided by `cypress-mx-report` plugin.<br/>

As combining multiple report runs into a single report is a great feature, this
plugin takes care that screenshots/videos of previous test runs are not
overwritten, which Cypress would normally do. To accomplish this, the plugin
will tell Cypress at runtime to create a unique subdirectory for the test run to
save the screenshots/videos in and it will tell Mochawesome the links to these
files, so that Mochawesome can integrate them into the report.

## Install

```bash
npm install @bfoese/cypress-mx-report --save-dev
```

## How to use

First, you should have Cypress and Mochawesome installed.

### Cypress config

This is the minimal Cypress config needed for this plugin:

```bash
# content of projects/my-app/cypress.json
{
  "supportFile": "projects/my-app/cypress/support/index.ts",
  "pluginsFile": "projects/my-app/cypress/plugins/index.ts",
  "videosFolder": "projects/my-app/cypress/videos",
  "screenshotsFolder": "projects/my-app/cypress/screenshots",
  "reporter": "cypress-multi-reporters",
  "reporterOptions": {
    "configFile": "projects/my-app/cypress/reporter-config.json"
  }
}
```

This plugin requires a Cypress `supportFile` and `pluginFile`. Define the paths
for these files, if not already added. And create these files, if they don't yet
exist. See official Cypress documentation for this:
https://docs.cypress.io/guides/tooling/plugins-guide#Installing-plugins

As the sole purpose of this plugin is to attach screenshots and/or videos to a
Mochawesome report, you also need to configure the preferred directories for
these media files which is done by defining the paths for `screenshotsFolder`
and/or `videosFolder`. By default, Cypress would store screenshots and videos
into the directory paths you define here. And when you have multiple succeeding
Cypress runs, the screenshots/videos of the previous run will be overwritten.
But this plugin aims to combine multiple Cypress runs to be combined into a
single report. Therefore this plugin will ensure that the screenshots/videos of
a Cypress run will be stored into a subdirectory of the path you define here.

The options `reporter` and `reporterOptions` are needed to make sure that
Mochawesome is being used as a Cypress reporter. In `reporterOptions.configFile`
a path to a file named `reporter-config.json` is being declared. This file
should contain this:

```bash
# content of projects/my-app/cypress/reporter-config.json
{
    "reporterEnabled": "mochawesome",
    "mochawesomeReporterOptions": {
        "reportDir": "projects/my-app/cypress/results/json",
        "overwrite": false,
        "html": false,
        "json": true
    }
}
```
During the Cypress test run, Mochawesome will create a JSON file for each spec
file that was contained in the test run. With `reportDir` you tell Mochawesome
where these JSON files are allowed to be stored. When generating the report,
Mochawesome-Merge will merge all JSON files contained in this directory into a
single report.

### Register the plugin as new Cypress plugin

Your project should have a Cypress plugins file: `cypress/plugins/plugin.ts`.

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

In order to have screenshots and/or videos embedded into your Mochawesome
report, you need to add the following code.

```bash
# cypress/support/index.ts
import { CypressMxReport } from '@bfoese/cypress-mx-report/dist/support';

# Include this line to have screenshots and videos attached to the report
CypressMxReport.includeMedia(Cypress);

# Or use the options object to control which media files should be included in the report and which not
CypressMxReport.includeMedia(Cypress, opts: { screenshots: true});
CypressMxReport.includeMedia(Cypress, opts: { videos: true});
```

### Report Generation

Create some reusable scripts in your `package.json`:

```bash
"e2e:run": "cypress run --config-file projects/my-app/cypress.json",
"prereport:gen": "cd projects/my-app/cypress && mochawesome-merge ./results/json/*.json > ./results/mochawesome-bundle.json
  && mkdirp public/videos && mkdirp ./videos/ && ncp ./videos ./public/videos
  && mkdirp public/screenshots && mkdirp ./screenshots/ && ncp ./screenshots ./public/screenshots",
"report:gen": "cd projects/my-app/cypress && marge ./results/mochawesome-bundle.json --reportDir ./public --assetsDir ./public/assets --reportPageTitle 'E2E Report' -f e2e-report.html --charts true --code true"
```

The script `e2e:run` is the normal Cypress command to start a test run.
You can perform multiple subsequent report runs with different configuration, e.g.

```bash
# 1st test run to include in the report
npm run e2e:run -- --config baseUrl=https://my-app.com --browser edge
# 2nd test run to include in the report
npm run e2e:run -- --config baseUrl=https://my-app.com --browser chrome
# 3rd test run to include in the report
npm run e2e:run -- --config baseUrl=https://my-app.com --browser firefox
```

When your test runs are finished you can start the report generation:
```bash
npm run report:gen
```

This script requires Mochawesome-Merge and Mochawesome-Report-Generator to be
installed which are not defined as peer-dependencies by this plugin as you could
also use other tools to further process the Mochawesome JSON.

The command `report:gen` will implicitly execute the script `prereport:gen` at
the beginning. You need to check and adapt these two scripts, if your
`cypress.json` uses other names for the screenshots and videos directories as
compared to shown above.

The purpose of `prereport:gen` is to let Mochawesome-Merge to merge all JSON
files of the performed Cypress test runs into a single JSON file named
`mochawesome-bundle.json`. The script will then copy the content of your Cypress
screenshots/videos directory into a directory named `public` which in the end
will contain the generated report HTML. In the last step,
Mochawesome-Report-Generator (`marge`) will take the `mochawesome-bundle.json`
to generate an HTML report file named `e2e-report.html` from it.
