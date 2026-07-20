# Changelog

## [0.2.0](https://github.com/mshima/generator-parse/compare/v0.1.3...v0.2.0) (2026-07-20)

### Features

- add github actions checkout and setup-node versions ([#52](https://github.com/mshima/generator-parse/issues/52)) ([ff88935](https://github.com/mshima/generator-parse/commit/ff88935153c7892ce4db51018dc4c5c912c44811))

### Bug Fixes

- calculate repository check in release-please-action template ([#43](https://github.com/mshima/generator-parse/issues/43)) ([0572657](https://github.com/mshima/generator-parse/commit/0572657c689b58217b05471a33598cd7a4af2a1a))
- replace npm install with npm ci ([#40](https://github.com/mshima/generator-parse/issues/40)) ([54e6139](https://github.com/mshima/generator-parse/commit/54e6139baf460182e1c5b8a16b33ff5281149e0c))
- use setup-node with package-manager-cache as recommended ([#42](https://github.com/mshima/generator-parse/issues/42)) ([c42dcd1](https://github.com/mshima/generator-parse/commit/c42dcd1036302ff6c3ffdafc50c8f9e284ac90e9))

## [0.1.3](https://github.com/mshima/generator-parse/compare/v0.1.2...v0.1.3) (2026-05-22)

### Bug Fixes

- add commented conditional to release-please-action ([#37](https://github.com/mshima/generator-parse/issues/37)) ([5110a18](https://github.com/mshima/generator-parse/commit/5110a184af62e14702aabdfcaf0d6a1479dffa43))
- add commitlint template ([#39](https://github.com/mshima/generator-parse/issues/39)) ([e7855f4](https://github.com/mshima/generator-parse/commit/e7855f426892f653c6a33a59868e0a046be82b36))
- add prompt to choose template ([#38](https://github.com/mshima/generator-parse/issues/38)) ([901b615](https://github.com/mshima/generator-parse/commit/901b61589274286eafd9a017a5cb43bf420e5848))
- resolve package.json versions ([#35](https://github.com/mshima/generator-parse/issues/35)) ([831f0b4](https://github.com/mshima/generator-parse/commit/831f0b4077353afdf9414257c25524c8788536b0))

## [0.1.2](https://github.com/mshima/generator-parse/compare/v0.1.1...v0.1.2) (2026-05-07)

### Bug Fixes

- add workspaces to manifest ([#31](https://github.com/mshima/generator-parse/issues/31)) ([91547e0](https://github.com/mshima/generator-parse/commit/91547e02af77d140d92b48b3c84d089352fa015b))
- move comment to end of block to improve syntax highlight ([#28](https://github.com/mshima/generator-parse/issues/28)) ([96cab2c](https://github.com/mshima/generator-parse/commit/96cab2c1917052fb4b7b37bd26080807f301860b))
- remove test, it should happen before release tagging ([#27](https://github.com/mshima/generator-parse/issues/27)) ([e63ac8c](https://github.com/mshima/generator-parse/commit/e63ac8c47a65b90c4755aee8b07e5b6b059faf9f))

## [0.1.1](https://github.com/mshima/generator-parse/compare/v0.1.0...v0.1.1) (2026-05-03)

### Bug Fixes

- always write config-file and manifest-file config ([#12](https://github.com/mshima/generator-parse/issues/12)) ([2279fbf](https://github.com/mshima/generator-parse/commit/2279fbf59a24da85deae4e2ca263d387069d4337))
- make supported template types extensible ([#17](https://github.com/mshima/generator-parse/issues/17)) ([f7c28e1](https://github.com/mshima/generator-parse/commit/f7c28e1449c159e87ef95e8adb360a91a5a27a0d))
- merge package.json instead of write ([#16](https://github.com/mshima/generator-parse/issues/16)) ([66838cf](https://github.com/mshima/generator-parse/commit/66838cf4852ec6d5bc93adb90879c9c7bec20a41))
- write workspaces in release-please-config.json ([#14](https://github.com/mshima/generator-parse/issues/14)) ([ee69001](https://github.com/mshima/generator-parse/commit/ee6900149107d04dd07a177eec7835927743daf4))
