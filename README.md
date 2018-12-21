# New NPM module template with ESNext support

This is a good starting to create a middleware that is backward compatible with node 4
but can use the new ESNext syntax with babel.

# What is in the package

- Execution with Babel (env preset) in [.babelrc](./.babelrc). Only compile what is not available. Support for (`import`/`export`).
- Bundling with [rollup](https://rollupjs.org/) in one distribution file (with sourcemaps).
- Building for node 4 with (env preset) in [.babelrc-build](./.babelrc-build) in `/dist`.
- Linting with ESLint (setup your lint in [.eslintrc.js](./.eslintrc.js) - currently set with ebay template).
- Test with [JEST](https://facebook.github.io/jest/docs/en/getting-started.html)
  - Test are local in `.spec.js` files.
  - Coverage test enforced (currently 50%) but you can change it in the [package.json](./package.json).
- Precommit hook runs tests and linting (with `--fix` so you do not waste time).
- Set up node version with nvm in `.nvmrc`.
- `npm publish` run test and build the repo.
-  Step by step debugging with `npm run debugTest` (use with [`chrome://inspect`](https://medium.com/the-node-js-collection/debugging-node-js-with-google-chrome-4965b5f910f4)).
-  Watching tests with `watch:test` (use it while you develop!)
-  Coverage with `npm run cover` and HTML report in the browser with `npm run coverHTML`

# How to use it

- Clone this repo
- `npm install -g yarn`
- `yarn`
- `npm run watch:test` while you develop!
- Modify the file in [./lib](./lib) as you like
