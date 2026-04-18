// Stagehand browser automation tool (Claude-native)
// TODO (hackathon): instantiate Stagehand with Anthropic model, then expose:
//   - browse(url, instruction): navigate + extract
//   - extractTable(url): pull structured tabular data from a page
// Uses BROWSERBASE_API_KEY when set, otherwise local Playwright.

export type StagehandResult = {
  url: string;
  text: string;
  screenshot?: string;
};

export async function stagehandBrowse(
  url: string,
  instruction: string,
): Promise<StagehandResult> {
  throw new Error("stagehandBrowse not implemented — wire up during hackathon");
}
