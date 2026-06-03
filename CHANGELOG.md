# @laioutr/app-actindo

## 0.0.1

### Patch Changes

- 28fc102: Declare `@laioutr-core/kit` and `defu` as dependencies. They are imported by the module at runtime but were previously only resolved through hoisting, which broke installs in strict node_modules layouts.
