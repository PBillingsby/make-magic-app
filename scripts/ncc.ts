#!/usr/bin/env ts-node-script

import path from 'path';
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - `@vercel/ncc` is not typed
import ncc from '@vercel/ncc';
import parse from 'parse-package-name';
import bytes from 'bytes';
import JSON5 from 'json5';
import JSONstringifyCompact from 'json-stringify-pretty-compact';

console.log();
console.log(`Pre-compiling dependencies...`);
console.log();

const baseDir = path.resolve(__dirname, '..', 'compiled');

// Cleanup current state of `compiled/*` directory...
const cleanups = fs.readdirSync(baseDir).filter((i) => fs.statSync(path.join(baseDir, i)).isDirectory());
for (const dir of cleanups) {
  fs.rmSync(path.join(baseDir, dir), { recursive: true });
}

// Pre-compile certain node_modules defined in `compiled/config.jsonc`
const pkgs = JSON5.parse(fs.readFileSync(path.join(baseDir, 'config.jsonc')).toString('utf-8'));
Promise.all<number>(
  pkgs.map(async (pkg: any) => {
    await precompileDependency(pkg);
    const footprint = await getDirectorySize(path.join(baseDir, pkg));
    console.log(`✓ ${pkg} (${bytes(footprint)})`);
    return footprint;
  }),
)
  .then((result) => {
    console.log();
    console.log(`Total footprint: ${bytes(result.reduce((acc, next) => acc + next, 0))}`);
    console.log();

    updateTSConfigPaths();
  })
  .catch(handleError);

/**
 * Get the size of a directory's contents, recursively.
 */
async function getDirectorySize(dir: string): Promise<number> {
  const listing = (await fs.promises.readdir(dir)).map((i) => path.join(dir, i));

  return listing.reduce(async (acc, curr) => {
    if (fs.statSync(curr).isDirectory()) {
      return Promise.resolve((await acc) + (await getDirectorySize(curr)));
    }

    const { size } = fs.statSync(curr);
    return Promise.resolve((await acc) + size);
  }, Promise.resolve(0));
}

/**
 * Pre-compile a node_module dependnecy using `@vercel/ncc`.
 */
async function precompileDependency(input: string) {
  // Parse the specified package information
  // and resolve a destination path
  const pkg = parse(input);
  const destination = path.join(baseDir, pkg.name);

  /**
   * Write a file with the given data to `[root]/compiled/[pkg.name]`.
   */
  const write = (file: string, data: any) => {
    if (file && data) {
      fs.writeFileSync(file, data, { encoding: 'utf-8' });
    }
  };

  /**
   * Once the dependency is built using `@vercel/ncc`,
   * write the output to `[root]/compiled/[pkg.name]`.
   */
  const postBuild = ({ code }: any) => {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    write(path.join(destination, 'index.js'), code);
    writeLicense();
    writePackageJson();
  };

  /**
   * Write a LICENSE file for the dependency currently being compiled.
   */
  const writeLicense = () => {
    const pkgPath = path.join(__dirname, '../node_modules', pkg.name);
    const licensePath = [
      path.join(pkgPath, './LICENSE'),
      path.join(pkgPath, './LICENSE.md'),
      path.join(pkgPath, './LICENSE.txt'),
      path.join(pkgPath, './license'),
      path.join(pkgPath, './license.md'),
      path.join(pkgPath, './license.txt'),
    ].find((file) => fs.existsSync(file));

    if (licensePath) {
      write(path.join(destination, 'LICENSE'), fs.readFileSync(licensePath));
    }
  };

  /**
   * Get the `package.json` file for the dependency currently being compiled.
   */
  const getPackageJson = () => {
    const pkgJsonPath = path.join(__dirname, '../node_modules', pkg.name, 'package.json');
    return JSON.parse(fs.readFileSync(pkgJsonPath).toString('utf-8'));
  };

  /**
   * Write a minimal `package.json` file for the dependency currently being compiled.
   */
  const writePackageJson = () => {
    const { name, version, author, license } = getPackageJson();

    const data = `${JSON.stringify({
      name,
      version,
      main: 'index.js',
      ...(author ? { author } : undefined),
      ...(license ? { license } : undefined),
    })}\n`;

    write(path.join(destination, 'package.json'), data);
  };

  const externals = Object.keys(getPackageJson().peerDependencies ?? {});
  return ncc(require.resolve(pkg.name), { cache: false, minify: true, quiet: true, target: 'es6', externals })
    .then(postBuild)
    .catch(handleError);
}

function updateTSConfigPaths() {
  const pathToTSConfig = path.join(__dirname, '..', 'tsconfig.json');
  // TSConfig depends on JSON5
  const tsconfig = JSON5.parse(fs.readFileSync(pathToTSConfig).toString('utf-8'));

  tsconfig.compilerOptions.paths = {
    'core/*': ['core/*'],
    'scaffolds/*': ['scaffolds/*'],
    'compiled/*': ['compiled/*', 'node_modules/@types/*', 'node_modules/*'],
  };

  for (const pkg of pkgs) {
    tsconfig.compilerOptions.paths[pkg] = [`compiled/${pkg}`, `node_modules/@types/${pkg}`, `node_modules/${pkg}`];
  }

  const data = JSONstringifyCompact(tsconfig, { maxLength: 120 });

  fs.writeFileSync(pathToTSConfig, `${data}\n`, { encoding: 'utf-8' });
}

/**
 * Log the given `err` and exit the process with status code `1`.
 */
function handleError<T extends Error>(err: T) {
  console.error(err);
  process.exit(1);
}
