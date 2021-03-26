export class CypressMxReportPlugin {
  /**
   * This function will register the plugin. The plugin will generate a unique
   * ID for each test run and make sure that screenshots and videos are stored
   * in a subdirectory of the originial screenshotFolder/videosFolder. The
   * subdirectory will be named with the unique ID of the test run.
   *
   * This way, you can have multiple cypress runs with different
   * configurations and screenshots/videos are stored for each of them and not
   * beeing overwritten by following cypress runs.
   *
   * Must be called from cypress/plugins/index.ts
   *
   * @param config - Cypress config object
   *
   *
   * @returns A config object with modified screenshotsFolder and videosFolder
   * path. In order to have this config applied, you need to return in from your
   * module.exports function in cypress/plugins/index.js.
   *
   * @see
   * https://docs.cypress.io/guides/tooling/plugins-guide#Using-a-plugin
   */
  public static register(config: any): any {
    const path = require("path");

    const mxTestRunId =
      config?.env?.mxTestRunId ??
      `${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;

    if (config?.screenshotsFolder) {
      config.screenshotsFolder = path.join(
        config.screenshotsFolder,
        mxTestRunId
      );
    }

    if (config?.videosFolder) {
      config.videosFolder = path.join(config.videosFolder, mxTestRunId);
    }
    // mxTestRunId will be used in support file to create the correct screenshot/video URL
    config.env = Object.assign(config.env ?? {}, { mxTestRunId: mxTestRunId });
    return config;
  }
}
