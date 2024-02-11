# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 4.8.0 (2024-02-11)


### Features

* allow defineEndpoint overload without method and with deprecation ([127e7c3](https://github.com/typepoint/typepoint/commit/127e7c3a71679ea9a655146725da9afd1cdfda64))





# 4.7.0 (2024-02-09)


### Features

* pass endpoint definition in context to handler ([2492aba](https://github.com/typepoint/typepoint/commit/2492abae5cadf68ddf1b674f9fb0b7aeb44d88fb))





# 4.6.0 (2024-02-09)


### Features

* add ability to mark endpoints as deprecated ([f3f0834](https://github.com/typepoint/typepoint/commit/f3f0834213a38d0a82f7b1fe92b0bf47a431c1ee))





## 4.5.4 (2021-12-09)


### Bug Fixes

* query param values were not being decoded ([7e5bbd7](https://github.com/typepoint/typepoint/commit/7e5bbd77923eda65f1f19e4be95c1d71366d9ec4)), closes [#77](https://github.com/typepoint/typepoint/issues/77)





## 4.5.3 (2021-12-06)


### Bug Fixes

* sync peer dependencies after version bump and before publishing packages - attempt 3 ([00c177d](https://github.com/typepoint/typepoint/commit/00c177dcc73f5f6f6b40573efe9ac9b3c598f551))





## 4.5.2 (2021-12-06)


### Bug Fixes

* sync peer dependencies after version bump and before publishing packages - attempt 2 ([c469e87](https://github.com/typepoint/typepoint/commit/c469e879118e587c87b2b19751ae7c941dd9ffbd))





## 4.5.1 (2021-12-06)


### Bug Fixes

* sync peer dependencies after version bump and before publishing packages ([f36c244](https://github.com/typepoint/typepoint/commit/f36c2442f5e38e6cfc47481bd96feeb8cca83878))





# 4.5.0 (2021-08-12)


### Features

* useEndpoint().refetch() now returns an object with promise property ([b4a7656](https://github.com/typepoint/typepoint/commit/b4a7656f34a1bddba64944c5378ab4068c083a53))





# 4.4.0 (2021-08-11)


### Features

* add useTypePoint react hook ([86fa580](https://github.com/typepoint/typepoint/commit/86fa5809603bca7694c3501ab242c841f4591be8))





# 4.3.0 (2021-08-09)


### Features

* improved route matching ([dd2a917](https://github.com/typepoint/typepoint/commit/dd2a917ec1e6becdf579ca51014f59bff123b247)), closes [#63](https://github.com/typepoint/typepoint/issues/63)





# 4.2.0 (2021-08-09)


### Features

* add onSuccess and onFailure handlers ([2d776c9](https://github.com/typepoint/typepoint/commit/2d776c980a854412a259134d7f6fed06da174e17))





# 4.1.0 (2021-08-08)


### Features

* return statusCode and body directly from useEndpoint and useEndpointLazily hooks ([ba5587d](https://github.com/typepoint/typepoint/commit/ba5587d8209d7537d284de22291a41afbc6088ec))





## 4.0.5 (2021-08-08)


### Bug Fixes

* update client axios peer version range ([5d93f32](https://github.com/typepoint/typepoint/commit/5d93f32df0fdb022b923931f7580eea46716df30))





## 4.0.4 (2021-08-08)

**Note:** Version bump only for package @typepoint/shared





## 4.0.3 (2021-08-08)

**Note:** Version bump only for package @typepoint/shared





## 4.0.2 (2021-08-08)

**Note:** Version bump only for package @typepoint/shared





## [4.0.1](https://github.com/typepoint/typepoint/compare/v4.0.0...v4.0.1) (2021-08-07)


### Bug Fixes

* bump peer dependency versions ([2397ccb](https://github.com/typepoint/typepoint/commit/2397ccb05c8c7540212ce2743f2d7db1d2e4380a))





# [4.0.0](https://github.com/typepoint/typepoint/compare/v3.0.3...v4.0.0) (2021-08-07)


### Features

* update build process, peer dependencies ([17ac5cd](https://github.com/typepoint/typepoint/commit/17ac5cdf94a57e8a960cd7fec2b2245a9bee3c37))


### BREAKING CHANGES

* All TypePoint libraries use the same version number now.
You may need to manually install dependencies that are now peer dependencies. Take note of warnings about peer dependencies not met when installing.





## 3.0.3 (2021-06-06)

**Note:** Version bump only for package @typepoint/shared





## [3.0.2](https://github.com/typepoint/typepoint/compare/@typepoint/shared_v3.0.1...@typepoint/shared_v3.0.2) (2020-03-29)


### Bug Fixes

* remove private field from package.json ([8e7b3ca](https://github.com/typepoint/typepoint/commit/8e7b3ca894922e10b7e3566f60e0e58dadccf545))

## [3.0.1](https://github.com/typepoint/typepoint/compare/@typepoint/shared_v3.0.0...@typepoint/shared_v3.0.1) (2020-03-18)


### Bug Fixes

* update package author, contributors, keywords ([41ba6fa](https://github.com/typepoint/typepoint/commit/41ba6fa2f66ca147008046551cd917ce0a7f4ddc))

# [3.0.0](https://github.com/typepoint/typepoint/compare/@typepoint/shared_v2.0.5...@typepoint/shared_v3.0.0) (2020-03-10)


### Bug Fixes

* yarn validate was not validating server ([5558f9f](https://github.com/typepoint/typepoint/commit/5558f9f140bc52c228980e0defda67423dd008bf))
* **ci:** fix updating of types entry in package.json ([cf8ccc6](https://github.com/typepoint/typepoint/commit/cf8ccc681c71a4b1bc84edc6c9aefee9d0fc8959))
* **defineendpoint:** path will no longer include extraneous slashes ([000421d](https://github.com/typepoint/typepoint/commit/000421d8d01960b11b9a0f083008e6fff607f4af))
* **middleware:** remove chalk ([fe1b1c5](https://github.com/typepoint/typepoint/commit/fe1b1c5baea8ab5fadffdc4508bb646634300611))
* **package:** add author ([e131bcd](https://github.com/typepoint/typepoint/commit/e131bcdc3d39ee6e50819b6aee730ef1ea5509e3))
* **package:** add author ([7f95859](https://github.com/typepoint/typepoint/commit/7f9585912cfa342acdb324eb1f565b582383edcf))
* **package:** fix types entry in package.json ([c9633d5](https://github.com/typepoint/typepoint/commit/c9633d5e1addda49fa04c92be00a8c408b2e791e))
* **package:** fix types entry in package.json ([949f03a](https://github.com/typepoint/typepoint/commit/949f03adcf0c5c812d864e65a0da0ed5c23395f9))
* **package:** fix types entry in package.json ([27d0d38](https://github.com/typepoint/typepoint/commit/27d0d38545199c6a252bf947b21d27fb6ef108eb))
* **package:** fix types entry in package.json ([b026d91](https://github.com/typepoint/typepoint/commit/b026d918b1a42e7f68cda4192de887e2e48f5616))
* **package:** fix types entry, use latest shared ([649e724](https://github.com/typepoint/typepoint/commit/649e72406460d19483394c46222a2dffe0af92e3))
* **todoservice:** fix fixtures import ([23c8989](https://github.com/typepoint/typepoint/commit/23c898932fa59c81cda58f2307fe400ea57fa000))


### Features

* add dependency diagram for reference ([b3ff237](https://github.com/typepoint/typepoint/commit/b3ff237ae9c8eb8ac77adb01436c6aafb5df2201))
* force major version bump ([1a729f4](https://github.com/typepoint/typepoint/commit/1a729f41cad74f044745dc853e3389c7c6fcb3a1))
* move code around ([1481e81](https://github.com/typepoint/typepoint/commit/1481e81e3ac57b7830f66f2a97e8e61681b83ed8))
* **core:** type overhaul ([5731717](https://github.com/typepoint/typepoint/commit/573171725098204175d317debbbf9e4bcf2463fe))
* **types:** loosen types on validateAndTransform function ([79a2d37](https://github.com/typepoint/typepoint/commit/79a2d375aea799153dfe2c8e7c31478d3f1910f3))


### BREAKING CHANGES

* The breaking changes were in earlier commits not yet released. This commit is just to forcefully bump the major version.

## [2.0.5](https://github.com/typepoint/typepoint/compare/@typepoint/shared_v2.0.4...@typepoint/shared_v2.0.5) (2019-11-17)


### Bug Fixes

* **types:** fix types entry in package.json ([6b05c72](https://github.com/typepoint/typepoint/commit/6b05c72d74c8a8645957c3d56267dfa914647100))

## [2.0.4](https://github.com/typepoint/typepoint/compare/@typepoint/shared_v2.0.3...@typepoint/shared_v2.0.4) (2019-11-17)


### Bug Fixes

* **package:** add missing author tag ([a72b554](https://github.com/typepoint/typepoint/commit/a72b554aebaa0b9d0b48bed7d74ba35fab7c7047))

## [2.0.3](https://github.com/typepoint/typepoint/compare/@typepoint/shared_v2.0.2...@typepoint/shared_v2.0.3) (2019-11-17)


### Bug Fixes

* **readme:** add logo ([6590c68](https://github.com/typepoint/typepoint/commit/6590c6892e2130ba91e8839510087be2d2aaa06b))
* **release:** fix broken release script ([74bc382](https://github.com/typepoint/typepoint/commit/74bc38242ce07e8e8c9ea930e649ed17fa161968))

## [2.0.3](https://github.com/typepoint/typepoint/compare/@typepoint/shared_v2.0.2...@typepoint/shared_v2.0.3) (2019-11-17)


### Bug Fixes

* **readme:** add logo ([6590c68](https://github.com/typepoint/typepoint/commit/6590c6892e2130ba91e8839510087be2d2aaa06b))

# Changelog

All notable changes to this project will be documented in this file.

### [2.0.2](https://github.com/typepoint/typepoint/compare/v2.0.1...v2.0.2) (2019-10-24)

### [2.0.1](https://github.com/typepoint/typepoint/compare/v0.1.0...v2.0.1) (2019-10-24)
