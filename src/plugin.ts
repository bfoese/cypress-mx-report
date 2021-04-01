const path = require("path");

/**
 * This code will run in the Cypress plugin context. This context is executed in
 * a NodeJS environment. Therefore Node specific modules like `path` can be
 * used.
 */
export class CypressMxReportPlugin {

  /**
   * This function will register the plugin. The plugin will generate a unique
   * ID for each test run and make sure that screenshots and videos are stored
   * in a subdirectory of the original screenshotFolder/videosFolder. The
   * subdirectory will be named with the unique ID of the test run.
   *
   * This way, you can have multiple cypress runs with different
   * configurations and screenshots/videos are stored for each of them and not
   * beeing overwritten by following cypress runs.
   *
   * Must be called from cypress/plugins/index.ts
   *
   * @param config - Cypress config object
   * @returns A config object with modified screenshotsFolder and videosFolder
   * path. In order to have this config applied, you need to return in from your
   * module.exports function in cypress/plugins/index.js.
   *
   * @see
   * https://docs.cypress.io/guides/tooling/plugins-guide#Using-a-plugin
   */
  public static register(config: any): any {
    // if user provided a test run ID prefer this, otherwise generate one
    const mxTestRunId =
      config?.env?.mxTestRunId ??
      `${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;

    if (config?.screenshotsFolder) {
      const screenshotsFolderName = this.lastPathSegment(config.screenshotsFolder);
      config.screenshotsFolder = path.join(
        config.screenshotsFolder,
        mxTestRunId
      );
      // Provide the new screenshotsFolder sub-path as env variable. This will
      // be used in the support file to generate URLs for the screenshots. Use
      // slash concatenation instad of path.join() - slash is supported on all
      // platforms and path module is not available in support file (browser
      // environment) so it will enhance the path with slashes as well
      config.env = Object.assign(config.env ?? {}, { mxScreenshotsFolder: `${screenshotsFolderName}/${mxTestRunId}` });
    }

    if (config?.videosFolder) {
      const videosFolderName = this.lastPathSegment(config.videosFolder);
      config.videosFolder = path.join(config.videosFolder, mxTestRunId);

      // Provide the new videosFolder sub-path as env variable. This will be used in the support file to generate URLs for the videos
      config.env = Object.assign(config.env ?? {}, { mxVideosFolder: `${videosFolderName}/${mxTestRunId}` });
    }
    return config;
  }


  /**
   * Extract the last segment from a path in a platform agnostic manner. I do
   * not use 'path' module here, because it gived no control over trailing
   * slash/backslash.
   *
   * @param path - Unix or Windows path, with or without trailing
   * slash/backslash, e.g. `foo/bar/baz`, `foo/bar/baz/`, `foo\\bar\\baz`,
   * `foo\\bar\\baz\\`
   * @returns Last path segment from the given path. If the path ends with a
   * trailing slash/backslash, the segment before will be returned. These
   * `foo/bar/baz`, `foo/bar/baz/`, `foo\\bar\\baz`, `foo\\bar\\baz\\` path
   * definitions will all return the same result, which is `baz`.
   */
   private static lastPathSegment(path: string | undefined): string | undefined {
    if (path) {
      const normalizedPath = path.replace(/\\/g, '/').replace(/\/$/, '');
      return normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);
    }
    return undefined;
  }
}
