import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const relPath = specifier.slice(2);
    let fullPath = path.resolve(process.cwd(), "src", relPath);
    if (!fs.existsSync(fullPath) && fs.existsSync(fullPath + ".ts")) {
      fullPath += ".ts";
    } else if (!fs.existsSync(fullPath) && fs.existsSync(fullPath + ".tsx")) {
      fullPath += ".tsx";
    }
    return {
      shortCircuit: true,
      url: pathToFileURL(fullPath).href,
    };
  }
  return nextResolve(specifier, context);
}
