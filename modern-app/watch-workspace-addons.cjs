"use strict";

const {
  findWorkspacePackagesNoCheck,
  arrayOfWorkspacePackagesToMap,
} = require("@pnpm/find-workspace-packages");
const path = require("path");
const fs = require("fs");

const monorepoRoot = path.join(__dirname, "../../../");

/**
 * For a given "currentPath", we determine what packages (specified in the package.json)
 * are from the monorepo.
 *
 * @param {string} currentPath directory of the package, containing the package.json
 */
async function addons(currentPath) {
  const thisPackage = require(path.join(currentPath, "package.json"));
  const { dependencies, devDependencies } = thisPackage;

  const allDependencies = [
    ...Object.keys(dependencies || {}),
    ...Object.keys(devDependencies || {}),
  ];

  const packageInfos = await findWorkspacePackagesNoCheck(monorepoRoot);
  const packageObjectMap = arrayOfWorkspacePackagesToMap(packageInfos);

  const relevantPackages = [];

  for (const [name, info] of Object.entries(packageObjectMap)) {
    if (!allDependencies.includes(name)) {
      continue;
    }

    // Info is an object of version => Object, but we only use one version throughout the monorepo
    // even if we didn't, for the purpose of discovering what is in the monorepo, we don't care about
    // what-would-be-extra-information.
    const actualInfo = Object.values(info)[0];
    relevantPackages.push(actualInfo);
  }

  const inMonorepoAddons = relevantPackages
    .map((packageInfo) => packageInfo.manifest)
    .filter((manifest) => manifest.keywords?.includes("ember-addon"));

  return inMonorepoAddons.map((manifest) => manifest.name);
}

const sideWatch = require("@embroider/broccoli-side-watch");

async function watchLibraries(projectDir) {
  const { packageUp } = await import("package-up");

  const libraries = await addons(projectDir);

  const promises = libraries.map(async (libraryName) => {
    const entry = require.resolve(libraryName, { paths: [projectDir] });
    const manifestPath = await packageUp({ cwd: entry });
    const packagePath = path.dirname(manifestPath);
    const manifest = require(manifestPath);

    if (!manifest.files) {
      return;
    }

    const toWatch = manifest.files.map((f) => path.join(packagePath, f));

    return toWatch;
  });

  const paths = (await Promise.all(promises)).flat().filter(Boolean);

  const relative = paths
    .filter((p) => {
      const repoRelative = p.replace(monorepoRoot, "");

      if (!fs.existsSync(p)) {
        // eslint-disable-next-line no-console
        console.warn(
          `Path ${repoRelative} doesn't exist. It will not be watched.`,
        );
        return false;
      }

      if (!fs.lstatSync(p).isDirectory()) {
        // eslint-disable-next-line no-console
        console.warn(
          `Path ${repoRelative} is not a directory. It will not be watched.`,
        );
        return false;
      }

      // NOTE: We don't have any libraries that don't need compilation today,
      //       but we might some day.
      return !p.endsWith("/src");
    })
    .map((p) => path.relative(projectDir, p));

  return sideWatch("app", { watching: relative });
}

module.exports = { addons, watchLibraries };
