# Example of using a monorepo with Ember

This is an example project to show some best practices and debugging for using Ember with a monorepo.
To allow a broad set of application set ups this project aims to have

1. A `legacy-app` which is using Ember 3.28 without Embroider
2. A `@my-org/ui` (directory name `modern-app`) which uses Ember 5.x with Embroider
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