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

**Note:** Version bump only for package typepoint





## 4.0.3 (2021-08-08)

**Note:** Version bump only for package typepoint





## 4.0.2 (2021-08-08)

**Note:** Version bump only for package typepoint





## [4.0.1](https://github.com/typepoint/typepoint/compare/v4.0.0...v4.0.1) (2021-08-07)


### Bug Fixes

* bump peer dependency versions ([2397ccb](https://github.com/typepoint/typepoint/commit/2397ccb05c8c7540212ce2743f2d7db1d2e4380a))





# [4.0.0](https://github.com/typepoint/typepoint/compare/v3.0.3...v4.0.0) (2021-08-07)


### Features

* remove path aliases to tp packages ([1272b25](https://github.com/typepoint/typepoint/commit/1272b2535c2122fb7ae1f375b4aa6ac24c9c6491))
* update build process, peer dependencies ([17ac5cd](https://github.com/typepoint/typepoint/commit/17ac5cdf94a57e8a960cd7fec2b2245a9bee3c37))


### BREAKING CHANGES

* All TypePoint libraries use the same version number now.
You may need to manually install dependencies that are now peer dependencies. Take note of warnings about peer dependencies not met when installing.





## 3.0.3 (2021-06-06)

**Note:** Version bump only for package typepoint
