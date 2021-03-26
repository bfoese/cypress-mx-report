export class CypressMxReport {
  /**
   * This function will append a screenshot link to the Mochawesome spec context
   * object. This will enhance your Mochawesome Cypress report with screenshots
   * of failed tests.
   *
   * Must be called from support/index.ts
   * @param Cypress
   */
  public static includeScreenshots(Cypress) {
    Cypress.on("test:after:run", (test: any, runnable: any) => {
      const addContext = require("mochawesome/addContext");

      const mxTestRunId = Cypress.env("mxTestRunId");

      if (mxTestRunId) {
        if (test.state === "failed") {
          // Cypress generates the name of the screenshot based on the test suite structure. We need to re-create that.
          let item: any = runnable;
          const nameParts = [runnable.title];

          // Iterate through all parents and grab the titles
          while (item.parent) {
            nameParts.unshift(item.parent.title);
            item = item.parent;
          }
          const fullTestName = nameParts.filter(Boolean).join(" -- ");
          const imageUrl = `screenshots/${mxTestRunId}/${Cypress.spec.name}/${fullTestName} (failed).png`;
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
    Cypress.on("test:after:run", (test: any, runnable: any) => {
      const addContext = require("mochawesome/addContext");

      const mxTestRunId = Cypress.env("mxTestRunId");

      if (mxTestRunId) {
        const videoUrl = `videos/${mxTestRunId}/${Cypress.spec.name.replace(
          "/.ts.*",
          ".ts"
        )}.mp4`;
        addContext({ test }, videoUrl);
      }
    });
  }
}
