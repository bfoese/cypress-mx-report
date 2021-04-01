const addContext = require('mochawesome/addContext');

export type CypressMxReportOptions = { screenshots: boolean, videos: boolean};

/**
 * These scripts are meant to be called from `cypress/support/index.ts` and
 * therefore will run in the browser and not in a NodeJS environment. Make sure
 * to only rely on APIs which are supported in the browser.
 */
export class CypressMxReport {

  /**
   * This function will append a screenshot link to the Mochawesome spec context
   * object. This will enhance your Mochawesome Cypress report with screenshots
   * of failed tests.
   *
   * Must be called from support/index.ts
   * @param Cypress
   * @param opts - If options are not provided, all media files will be attached
   * to the report. Otherwise you can use the options object to customize which
   * media files should be attached.
   */
  public static includeMedia(Cypress, opts?: CypressMxReportOptions): void {
    if (!opts || opts.screenshots) {
      this.includeScreenshots(Cypress);
    }

    if (!opts || opts.videos) {
      this.includeVideos(Cypress);
    }
  }
  /**
   * This function will append a screenshot link to the Mochawesome spec context
   * object. This will enhance your Mochawesome Cypress report with screenshots
   * of failed tests.
   *
   * Must be called from support/index.ts
   * @param Cypress
   */
  public static includeScreenshots(Cypress): void {
    Cypress.on('test:after:run', (test: any, runnable: any) => {
      const mxScreenshotsFolder = Cypress.env('mxScreenshotsFolder');

      if (mxScreenshotsFolder) {
        if (test.state === 'failed') {
          // Cypress generates the name of the screenshot based on the test suite structure. We need to re-create that.
          let item: any = runnable;
          const nameParts = [runnable.title];

          // Iterate through all parents and grab the titles
          while (item.parent) {
            nameParts.unshift(item.parent.title);
            item = item.parent;
          }
          const fullTestName = nameParts.filter(Boolean).join(' -- ');
          const imageUrl = `${mxScreenshotsFolder}/${Cypress.spec.name}/${fullTestName} (failed).png`;
          addContext({ test }, imageUrl);
        }
      }
    });
  }

  /**
   * This function will append a video link to the Mochawesome spec context
   * object. This will enhance your Mochawesome Cypress report with an embedded video file.
   *
   * Must be called from support/index.ts
   * @param Cypress
   */
  public static includeVideos(Cypress): void {
    Cypress.on('test:after:run', (test: any, runnable: any) => {
      const mxVideosFolder = Cypress.env('mxVideosFolder');
      if (mxVideosFolder) {
        const videoUrl = `${mxVideosFolder}/${Cypress.spec.name.replace(
          '/.ts.*',
          '.ts'
        )}.mp4`;
        addContext({ test }, videoUrl);
      }
    });
  }

}
