# Example of using a monorepo with Ember

This is an example project to show some best practices and debugging for using Ember with a monorepo.
To allow a broad set of application set ups this project aims to have

1. A `legacy-app` which is using Ember 3.28 without Embroider
  * Served on `http://localhost:4300`
2. A `@my-org/ui` (directory name `modern-app`) which uses Ember 5.x with Embroider
  * Served on `http://localhost:4301`
3. A `@my-org/shared-ui` v2 addon which is usable in both the `legacy-app` and `modern-app`
4. A `shared-ui-test` package which allows tests for the `shared-ui` addon/library
5. A `style-guide` application which contains a privately deployable/servable Ember app to use as an internal documentation/styleguide

# Steps to create this application

1. With `ember-cli@3.28.6` run `ember new legacy-app -sn --no-welcome -sg`
  * This creates a new 3.28 Ember application with non-embroider build tools, no NPM, no welcome page, and no git
2. Add workspace `package.json` and `pnpm-workspace.yaml` (see "PNPM Configuration" below for full steps and reasoning)
  1. In `package.json` declare `private: true` and `"packageManager": "pnpm@9.0.2"`
  2. In `pnpm-workspace.yaml` add `legacy-app` to `packages` list
3. Add workspace level `pnpm start` command
  * Install concurrently in workspace devDependencies
  * Add script to start all `_start:app:*` scripts
  * Add script `_start:app:legacy-app` which runs the regular `start` command for the `legacy-app`
3. Add Ember 5.x application using `ember-cli@5.8.1`
  * Run `ember new @my-org/ui --welcome-false -pnpm --directory modern-app --typescript --skip-git --embroider`
4. Add `modern-app` to PNPM application and global start command
  1. In `package.json` add script `_start:app:modern-app` which runs the regular `start` command for the `@my-org/ui` app
  2. In `pnpm-workspace.yaml` add `@my-org/ui` (directory) to `packages` list
  3. Update port config in `.ember-cli` files to match README
5. Add `@my-org/shared-ui` addon and test app using `@embroider/addon-blueprint`
  1. Run `ember addon @my-org/shared-ui -b @embroider/addon-blueprint --typescript --skip-git --pnpm --skip-npm --addon-location="addons/shared-ui/package" --test-app-name="test-app-for-shared-ui" --test-app-location="addons/shared-ui/test-app"` (better shown in "Commands")
  2. Add `addons/**/package` and `addons/**/test-app` to pnpm workspace
  3. Run `pnpm i`
6. Add `@my-org/shared-ui` base addon to workspace start script
  1. **FIX** (add `--preserveWatchOutput`) to `start:types` in addon package script to make sure glint does not clear build output on each build
  2. add script `_start:addons:shared-ui` which runs the regular `start` command for the `@my-org/shared-ui` app
  3. Update `start` to run `_start:apps:*` and `_start:addons:*` with better name/logging
7. Add `gts` (ember-template-import) to `@my-org/shared-ui` v2 Addon
  1. Install `@glimmer/component`/`@glimmer/tracking` as dev dependency
  2. Install `ember-template-imports` and prettier plugin with `pnpm add --save-dev ember-template-imports prettier-plugin-ember-template-tag`
  3. Configure eslint/prettier in `@my-org/shared-ui`
8. Add `gts` (ember-template-import) to `@my-org/ui` Modern Application
  1. Run `npx ember-apply @tcjr/apply-gts`
8. Add `gjs` (ember-template-import) to `legacy-app`
  1. Run `npx ember-apply @tcjr/apply-gts`
9. Start using `@my-org/shared-ui` from `@my-org/ui`
  1. Add `dependencies.@my-org/shared-ui: workspace:*` to `@my-org/ui` package.json
  2. Import and use `import Hello from '@my-org/shared-ui/components/hello/component';` in GTS component from `@my-org/ui`
  3. **NOTE** At this point, live-reload from addon changes **DOES NOT WORK**


### Commands (with whitespace)

Initialize Ember Application with 3.28

```sh
pnpm -g add ember-cli@3.28.6
ember new legacy-app \
  -sn \
  -sg \
  --no-welcome
```

Initialize Ember 5.8.1 Application with embroider

```sh
pnpm -g add ember-cli@5.8.1
ember new @my-org/ui \
  --no-welcome \
  -pnpm \
  --directory modern-app \
  --typescript \
  --skip-git \
  --embroider
```

Create v2 Addon and Test Project

```sh
ember addon @my-org/shared-ui -b @embroider/addon-blueprint \
  --typescript \
  --skip-git \
  --pnpm --skip-npm \
  --addon-location="addons/shared-ui/package" \
  --test-app-name="test-app-for-shared-ui" \
  --test-app-location="addons/shared-ui/test-app"
```