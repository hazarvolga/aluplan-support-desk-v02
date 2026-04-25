// graphify OpenCode plugin
// Injects knowledge graph context before tool calls and enriches architecture queries.
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export const GraphifyPlugin = async ({ directory }) => {
  const graphPath = join(directory, "graphify-out", "graph.json");
  const reportPath = join(directory, "graphify-out", "GRAPH_REPORT.md");

  let reminded = false;

  function graphAvailable() {
    return existsSync(graphPath);
  }

  function getGodNodes() {
    if (!existsSync(reportPath)) return null;
    try {
      const report = readFileSync(reportPath, "utf8");
      const match = report.match(/## God Nodes[\s\S]*?(?=\n##|\n---|\z)/);
      return match ? match[0].trim() : null;
    } catch {
      return null;
    }
  }

  return {
    // Before bash tool calls — remind once per session
    "tool.execute.before": async (input, output) => {
      if (reminded) return;
      if (!graphAvailable()) return;

      if (input.tool === "bash") {
        const godNodes = getGodNodes();
        const hint = godNodes
          ? `[graphify] Knowledge graph available at graphify-out/. Read GRAPH_REPORT.md before searching files.\nTop abstractions: ${godNodes.split("\n").slice(1, 4).join(", ")}\nUse: graphify query "<question>" | graphify path "<A>" "<B>" | graphify explain "<concept>"`
          : `[graphify] Knowledge graph available. Read graphify-out/GRAPH_REPORT.md for architecture context. Use graphify query/path/explain instead of grep.`;

        output.args.command = `echo "${hint}" && ` + output.args.command;
        reminded = true;
      }
    },
  };
};
