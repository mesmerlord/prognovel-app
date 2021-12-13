const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

const siteMetadata = require("../../../.cache/assets/publish/sitemetadata.json");
const { backend_api } = siteMetadata;
const buildFolder = "__sapper__/export";

if (process.env.NETLIFY) {
  const redirectsFile = join(buildFolder, "_redirects");

  const redirectsContent = readFileSync(redirectsFile, "utf-8");

  writeFileSync(
    redirectsFile,
    redirectsContent +
      `
  /feed/* ${new URL(backend_api).href}feed?novel=:splat
  /chapter-list/* ${new URL(backend_api).href}chapter-list?novel=:splat
  /* /404 
  `,
    "utf-8",
  );
} else if (process.env.VERCEL) {
  const vercelConfig = require("../../../vercel.json");

  vercelConfig.rewrites = [
    {
      source: "/read/:load*",
      destination: "/read?load=:load*",
    },
    {
      source: "/feed/:splat*",
      destination: `${new URL(backend_api).href}feed?novel=:splat*`,
    },
    {
      source: "/chapter-list/:splat*",
      destination: `${new URL(backend_api).href}chapter-list?novel=:splat*`,
    },
  ];

  writeFileSync("vercel.json", JSON.stringify(vercelConfig, null, 2), "utf-8");
}