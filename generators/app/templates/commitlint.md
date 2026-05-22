# commitlint setup

Summary: adds Commitlint with Husky so commit messages follow the Conventional Commits specification.

```ts liquid commitlint.config.ts
import type { UserConfig } from '@commitlint/types';

export default {
  extends: ['@commitlint/config-conventional'],
} satisfies UserConfig;
{% # commitlint.config.ts -%}
```

```json liquid package.json
{
  "scripts": {
    "prepare": "husky"
  },
  "devDependencies": {
    "@commitlint/cli": "latest",
    "@commitlint/config-conventional": "latest",
    "husky": "latest"
  }
}
{% # package.json -%}
```

```sh liquid .husky/commit-msg
npx --no -- commitlint --edit $1
{% # .husky/commit-msg -%}
```
