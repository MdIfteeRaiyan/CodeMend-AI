import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(process.cwd());
const readProjectFile = (relativePath: string) =>
  readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("public launch readiness contract", () => {
  it("labels secure execution and preserves the guided fallback", () => {
    const homePage = readProjectFile("client/src/pages/Home.tsx");

    expect(homePage).toContain("Guided preview · secure runner ready");
    expect(homePage).toContain("Prove the fix, case by case.");
    expect(homePage).toContain("Run diagnosis");
    expect(homePage).toContain("Give me a hint");
    expect(homePage).toContain("Show the solution");
    expect(homePage).toContain("Debug the cause.");
  });

  it("keeps untrusted compilation outside the Vercel application", () => {
    const api = readProjectFile("api/execute.ts");
    const guide = readProjectFile("SECURE_RUNNER.md");

    expect(api).toContain("CODE_RUNNER_BASE_URL");
    expect(api).toContain("MAX_REQUESTS_PER_WINDOW");
    expect(guide).toContain("fresh container or microVM");
    expect(api).not.toMatch(/child_process|execSync|spawnSync/);
  });

  it("keeps production execution requirements documented", () => {
    const deploymentGuide = readProjectFile("DEPLOYMENT.md");

    expect(deploymentGuide).toContain("Disable outbound network access");
    expect(deploymentGuide).toContain("CPU, memory, process-count");
    expect(deploymentGuide).toContain("Vercel deployment checks");
    expect(deploymentGuide).toContain("Real execution returns correct results");
  });

  it("does not introduce unrestricted process execution in the application layer", () => {
    const appFiles = [
      readProjectFile("client/src/pages/Home.tsx"),
      readProjectFile("server/routers.ts"),
      readProjectFile("server/db.ts"),
    ].join("\n");

    expect(appFiles).not.toMatch(/subprocess\.run|child_process\.exec|spawn\(/);
  });
});
