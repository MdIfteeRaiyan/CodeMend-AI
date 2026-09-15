import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(process.cwd());
const readProjectFile = (relativePath: string) =>
  readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("public launch readiness contract", () => {
  it("labels the current run experience as a browser-based guided check", () => {
    const homePage = readProjectFile("client/src/pages/Home.tsx");

    expect(homePage).toContain("Guided check · runs safely in your browser");
    expect(homePage).toContain("Apply fix and check");
    expect(homePage).toContain("Show answer");
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
