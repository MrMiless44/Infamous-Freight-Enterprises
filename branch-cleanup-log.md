# Branch Cleanup Log

Date: 2026-05-07 (UTC)
Repository: Infaemous-Freight/Infamous-freight

## Validation Checks Run

- `git fetch origin --prune`
- `git branch -r`
- `git push origin --delete <branch>` (attempted for each safe candidate; auth failed in this environment)
- `git fetch --prune`
- `git branch -r`

## Candidate Deletion Table (Before Any Deletion)

| Branch | Reason for deletion | Last commit date | Open PR | Head SHA |
|---|---|---|---|---|
| `codex/infamous-fix-issues-from-codex-review-for-pr-#1305-2026-04-10` | Stale generated codex/* branch | 2026-04-10 17:49:03 -0500 | No | `e688debcfffe920ca900b1e055c676fa3c1b0cb8` |
| `codex/infamous-fix-missing-files-in-docker-build-2026-04-18` | Stale generated codex/* branch | 2026-04-18 01:43:24 -0500 | No | `9c2a8c088506bea08aae5e7db42207d6515eeb15` |
| `codex/infamous-fix-repo-workflow-2026-04-29` | Stale generated codex/* branch | 2026-04-29 03:09:45 -0500 | No | `9cd7dd11d59b3ce8a762334aa94678fd536aa439` |
| `codex/infamous-fix-typescript-errors-and-tests-2026-03-31` | Stale generated codex/* branch | 2026-03-31 14:00:35 +0000 | No | `a32d87093b78f142b48a04b08c1ff3c29dcd20cb` |
| `codex/infamous-fix-unknown-env-config-warning-2026-04-06` | Stale generated codex/* branch | 2026-04-06 03:41:46 +0000 | No | `59570aae187ae1ae1e8a2b9971b77802883c845a` |
| `codex/infamous-fix-usage-tracking-error-handling-2026-03-31` | Stale generated codex/* branch | 2026-03-31 13:57:11 +0000 | No | `090a6382423facdc1d81e3676b9b0ba5f98ea0d3` |
| `codex/infamous-install-all-dependencies-for-repo-2026-04-22` | Stale generated codex/* branch | 2026-04-22 15:38:32 -0500 | No | `8c31111ffbc3369b817c9960b2a9ea838cbbb9b8` |
| `codex/infamous-install-ansible-playbook-and-shellcheck-2026-04-06` | Stale generated codex/* branch | 2026-04-06 15:05:39 +0000 | No | `eacc98260ddd7e026b027795279474ea38533da4` |
| `codex/infamous-install-docker-cli-2026-04-23` | Stale generated codex/* branch | 2026-04-23 03:49:29 -0500 | No | `67120f7e00a6bca1b638bbafcc340977761f5211` |
| `codex/infamous-install-docker-cli-2026-04-23-ea70qa` | Stale generated codex/* branch | 2026-04-23 07:33:38 -0500 | No | `8ba307d088857b0a478409afea7ede53fda5b062` |
| `codex/infamous-install-node_modules-2026-04-08` | Stale generated codex/* branch | 2026-04-08 01:57:25 -0500 | No | `a30d46b6e81bff5b260f8412a564dcf33c27c4ad` |
| `codex/infamous-integrate-sentry-for-error-handling-2026-04-08` | Stale generated codex/* branch | 2026-04-08 09:43:38 -0500 | No | `a766609332b391db56c22e0d1aa234fe43263875` |
| `codex/infamous-locate-deployment-30108a05e0ccbd98f00a1a4fb5978a05-2026-04-25` | Stale generated codex/* branch | 2026-04-25 00:04:07 -0500 | No | `791ec755b55d97e4bbdb0484c015947f53bb34e0` |
| `codex/infamous-locate-project-prj_v9ykx8ggdq4vdhudsxlyezopm6mg-2026-04-08` | Stale generated codex/* branch | 2026-04-08 09:40:11 -0500 | No | `11a9c3656708c0e6aa86ab405f86f6c8716bb172` |
| `codex/infamous-migrate-to-pnpm-across-repo-2026-04-22` | Stale generated codex/* branch | 2026-04-22 14:55:38 -0500 | No | `b3cee9f544e16019502209bdf6de6ecd2205382a` |
| `codex/infamous-prepare-infamous-freight-for-production-launch-2026-04-08` | Stale generated codex/* branch | 2026-04-08 12:53:15 -0500 | No | `1a3689c0cf2799d7b356d46bea0d2014684a52ac` |
| `codex/infamous-provide-recommendations-2026-04-17` | Stale generated codex/* branch | 2026-04-16 19:28:51 -0500 | No | `5dbff2c98b3d58d74d6206a08bcfa4136d6f5227` |
| `codex/infamous-provide-recommendations-2026-04-17-f3i8xj` | Stale generated codex/* branch | 2026-04-17 00:18:35 -0500 | No | `21ae6bf8d611653207137121a8da5e27aa661dbd` |
| `codex/infamous-provide-recommendations-2026-04-17-wdib84` | Stale generated codex/* branch | 2026-04-17 00:20:19 -0500 | No | `8250771f869b7e1417395f0f7b3073cb9aaa56ab` |
| `codex/infamous-provide-recommendations-2026-04-17-wje466` | Stale generated codex/* branch | 2026-04-17 00:15:25 -0500 | No | `0d6278ae570223a045ad5873c8ff51414375d321` |
| `codex/infamous-provide-recommendations-2026-04-17-yds6m5` | Stale generated codex/* branch | 2026-04-17 00:13:17 -0500 | No | `8260e8a918b755b3ed25f09bdfdaf5e2a3044ad3` |
| `codex/infamous-provide-ubuntu-installation-instructions-2026-04-21` | Stale generated codex/* branch | 2026-04-21 21:06:59 -0500 | No | `2cb9b0f813e6d07b2ca13a1bd11720c289a69f5d` |
| `codex/infamous-review-github-repo-and-compile-recommendations-2026-04-22` | Stale generated codex/* branch | 2026-04-22 15:09:06 -0500 | No | `ea1e27eb03328ddf08544665ffe549f92d47f590` |
| `codex/infamous-review-repository-for-updates-2026-04-08` | Stale generated codex/* branch | 2026-04-10 17:20:21 -0500 | No | `8aee4b4664f81a43642f48d7322abffcad650c6c` |
| `codex/infamous-run-build-and-test-steps-2026-04-29` | Stale generated codex/* branch | 2026-04-29 05:21:46 -0500 | No | `3add123c93118fd9f5a0d4e8c9701971eedc7942` |
| `codex/infamous-run-build-and-test-steps-2026-04-29-bd03f2` | Stale generated codex/* branch | 2026-04-29 05:31:52 -0500 | No | `0dfef0194ca2390751efaf186e0c79280edf1a29` |
| `codex/infamous-set-up-development-environment-2026-04-06` | Stale generated codex/* branch | 2026-04-06 11:00:26 +0000 | No | `36655e4b0495ae85b52c9b4980d0adf7eea58346` |
| `codex/infamous-set-up-multi-stage-docker-build-2026-04-07` | Stale generated codex/* branch | 2026-04-07 10:59:33 +0000 | No | `cb4838835eb838e8cc5b53ed68d6b497b686d0db` |
| `codex/infamous-task-title-2026-04-18` | Stale generated codex/* branch | 2026-04-18 01:47:40 -0500 | No | `f5a1343df3f8a19673180c7baa99694116424a2f` |
| `codex/infamous-task-title-2026-04-18-0hlhhi` | Stale generated codex/* branch | 2026-04-18 02:02:24 -0500 | No | `d9459e5700b1b79ae7195ae5b417b4f8e512ac42` |
| `codex/infamous-task-title-2026-04-18-2b6uun` | Stale generated codex/* branch | 2026-04-18 19:07:03 -0500 | No | `6ebbbc0813feb883e66b9d9250171702e3022a25` |
| `codex/infamous-task-title-2026-04-18-pdxqmp` | Stale generated codex/* branch | 2026-04-18 18:22:14 -0500 | No | `65682c4c807f99aa70b4834e93f6934e27f9a090` |
| `codex/infamous-task-title-2026-04-19` | Stale generated codex/* branch | 2026-04-19 19:08:27 -0500 | No | `c95959e63e027a1cc65faf594be7c05abc2e6ce7` |
| `codex/infamous-test-repository-setup-2026-04-08-h4om6j` | Stale generated codex/* branch | 2026-04-08 09:29:20 -0500 | No | `b670564a5e3bdd0cd028e850b85bf39681713a6c` |
| `codex/infamous-troubleshoot-netlify-command-failures-2026-04-07` | Stale generated codex/* branch | 2026-04-07 06:22:07 +0000 | No | `665cafe6e2996c0948a0a825e76bf2a41ac9672c` |
| `codex/infamous-update-all-requirements-to-latest-version-2026-04-29` | Stale generated codex/* branch | 2026-04-28 23:31:23 -0500 | No | `a35a4841b2446125cb6dce3d3ec87fdfb26e8bc8` |
| `codex/infamous-update-ci/cd-workflow-for-deployment-2026-04-29` | Stale generated codex/* branch | 2026-04-29 09:16:57 -0500 | No | `6cca9c6308b33f4da52bf29e39a4e0c61e3589a6` |
| `codex/infamous-update-ci/cd-workflow-for-deployment-2026-04-29-cvqcz3` | Stale generated codex/* branch | 2026-04-29 09:20:41 -0500 | No | `1aface570912f52c8c25fabe702bf86c68a4c668` |
| `codex/infamous-update-fly-machine-by-id-2026-04-29` | Stale generated codex/* branch | 2026-04-29 11:24:44 -0500 | No | `46af686f467f35452385d7ce67c6cb5d475c0cad` |
| `codex/infamous-update-fly-machine-by-id-2026-04-29-7v2p2x` | Stale generated codex/* branch | 2026-04-29 12:04:27 -0500 | No | `77c16e226d75228e764e24c15dd66d60dd5d9ea3` |
| `codex/infamous-update-fly-machine-by-id-2026-04-29-h6ylo8` | Stale generated codex/* branch | 2026-04-29 12:04:39 -0500 | No | `391d6044461f1a2049082c462b804c2349443c74` |
| `codex/infamous-update-readme-content-2026-04-08` | Stale generated codex/* branch | 2026-04-08 09:58:19 -0500 | No | `811f60918ffe3072ebc11d5a174b465f9f2bffce` |
| `codex/integrate-supabase-postgres-url-into-infamous-freight` | Stale generated codex/* branch | 2026-03-10 15:06:03 +0000 | No | `9456d519b8dee41e251ca04dce6a4b881b8c8d79` |
| `codex/make-github-main-branch-green` | Stale generated codex/* branch | 2026-03-15 21:14:21 -0500 | No | `c687313cb7c1fde6ba6a9279a7faa0507cb4b63a` |
| `codex/recommendations-feature` | Stale generated codex/* branch | 2026-04-16 18:07:06 -0500 | No | `ffcc8ee1be90e0aaf9f1c992b423f2cd2634627e` |
| `codex/resolve-codeql-default-setup-conflict` | Stale generated codex/* branch | 2026-04-02 13:38:13 +0000 | No | `390254663671f53256f0c7816e0e0e8a2b261c6f` |
| `codex/tmp-rebase-pr-1552-on-main-2026-04-25` | Stale generated codex/* branch | 2026-04-25 05:04:41 -0500 | No | `b4a6b07d42eec64edd8be2ccad8257a416638120` |
| `codex/update-commit-reference-link` | Stale generated codex/* branch | 2026-04-07 14:14:57 +0000 | No | `f74874ac6cbd34c4bb184980a553dee0a1fe330d` |
| `codex/update-infantus-freight-api` | Stale generated codex/* branch | 2026-04-19 19:09:37 -0500 | No | `874c69c7812615ddf3cf2486d65c474edafeac10` |
| `codex/update-pnpm-version-to-10-15-0` | Stale generated codex/* branch | 2026-04-04 09:59:11 +0000 | No | `8b93e6346d350c80210f88a5f403ec7d3e529d2a` |
| `conflict_210326_0052` | Stale generated conflict_* branch | 2026-03-21 05:52:19 +0000 | No | `6ffb35b647f12fe55f22a789c10fcdb72d701fe8` |
| `conflict_210326_0059` | Stale generated conflict_* branch | 2026-03-21 05:59:48 +0000 | No | `10bc66420f487624b8501c7dbe77b2f4e1e397e1` |
| `copilot/add-ci-cd-pipeline-enhancements` | Stale generated copilot/* branch | 2025-12-30 01:04:50 +0000 | No | `438c8d889752d69cb92e4608874146c77b7f5d38` |
| `copilot/add-ci-jobs-html-validation` | Stale generated copilot/* branch | 2025-12-29 06:37:36 +0000 | No | `e981bf8eb2be788c4be64e8d953243c1343a5d47` |
| `copilot/add-data-validation-rules` | Stale generated copilot/* branch | 2025-12-29 01:54:55 +0000 | No | `7ac98ec06c97259d22161b45cf2ec75741366a1c` |
| `copilot/add-improvements-to-infra-freight` | Stale generated copilot/* branch | 2026-03-09 10:34:19 +0000 | No | `552f28e398a33614797ccc5e49f4f42fbf41293c` |
| `copilot/add-nvmrc-and-package-json-updates` | Stale generated copilot/* branch | 2026-03-09 01:03:56 +0000 | No | `4135376eddbd5d4286da9952b984b99b17193dc4` |
| `copilot/add-pnpm-lock-file` | Stale generated copilot/* branch | 2025-12-29 01:05:28 +0000 | No | `2cfcb3bae62a23c84c33bb8e744f4f8f52b22fd7` |
| `copilot/add-production-rate-limits` | Stale generated copilot/* branch | 2026-04-27 03:52:31 -0500 | No | `39ed50130dbbf495bcede490801a2827a899bf83` |
| `copilot/add-upload-deploy-artifact` | Stale generated copilot/* branch | 2025-12-29 01:05:58 +0000 | No | `2084e749fd9fa13e48351bf11dc778fb44f256bd` |
| `copilot/add-workflow-alerts-mvp` | Stale generated copilot/* branch | 2026-04-27 03:50:00 -0500 | No | `3844a3adc803abaabe6196126a87b0f9da9bd5cc` |
| `copilot/address-review-feedback` | Stale generated copilot/* branch | 2026-03-06 03:20:36 +0000 | No | `f010ad3d812d3a54ea6ac52f6817c251613c1f36` |
| `copilot/address-review-feedback-ci-stability` | Stale generated copilot/* branch | 2026-03-06 03:18:52 +0000 | No | `51a906d45c61e539d77204c6247e848fea79241a` |
| `copilot/assign-driver-based-on-efficiency` | Stale generated copilot/* branch | 2025-12-29 07:21:01 +0000 | No | `806af3ff2378b5bc35c6bd4b9f08b86ac7f944bb` |
| `copilot/audit-and-optimize-repo` | Stale generated copilot/* branch | 2026-01-24 07:48:53 +0000 | No | `cf92919bd786475a7a8b872a9a2da66018825939` |
| `copilot/audit-infamous-freight-100` | Stale generated copilot/* branch | 2026-03-05 06:53:51 +0000 | No | `ce6518772eab60e4e0252e9c51153e5e7ec5c1c7` |
| `copilot/audit-repository-and-validation` | Stale generated copilot/* branch | 2026-01-24 07:39:07 +0000 | No | `b4aba3d10e9f2fa4b1d6169c9c982704f4f9ec06` |
| `copilot/build-and-deploy-github-pages` | Stale generated copilot/* branch | 2025-12-29 00:56:17 +0000 | No | `1b50267bf03f080713e82dba0cf932c40305cf29` |
| `copilot/build-deploy-github-pages` | Stale generated copilot/* branch | 2025-12-29 01:10:10 +0000 | No | `4f5153d46276b77b0e18b24415232648c64b37d9` |
| `copilot/build-dispatch-board-shipment-tracking` | Stale generated copilot/* branch | 2026-04-27 08:50:36 +0000 | No | `be948ce018c5c6f2ec140f863d8c9c3616f5fcee` |
| `copilot/build-jwt-authentication-system` | Stale generated copilot/* branch | 2026-03-21 01:11:29 -0500 | No | `60f21752c6d9992ac7c83f590e5a42706b64fa8f` |
| `copilot/build-quote-request-to-load-workflow` | Stale generated copilot/* branch | 2026-04-27 03:49:22 -0500 | No | `16d323bfa0ea4891627d48c4235fb5fb9ad62c25` |
| `copilot/build-quote-request-workflow` | Stale generated copilot/* branch | 2026-04-27 09:08:58 +0000 | No | `fb7c276069424d1897672d15c9b50fe855921982` |
| `copilot/chore-delete-stale-remote-branches` | Stale generated copilot/* branch | 2026-04-29 11:36:07 +0000 | No | `ec4127f6ec76af15884186ffbac004a9af96da76` |
| `copilot/complete-production-readiness-evidence` | Stale generated copilot/* branch | 2026-04-27 08:59:17 +0000 | No | `b763c4735037349b77fa8e3e3701e8483c4d41dd` |
| `copilot/confirm-carrier-onboarding-workflow` | Stale generated copilot/* branch | 2026-04-27 09:12:28 +0000 | No | `fa81871bd3fbdf3940baacb13dcfa4d9e2d1a5b1` |
| `copilot/confirm-document-retention-process` | Stale generated copilot/* branch | 2026-04-27 09:11:17 +0000 | No | `1275d4fa921aae6524a9fc9dda0c4974387f443d` |
| `copilot/enable-github-pages-main` | Stale generated copilot/* branch | 2025-12-29 00:59:47 +0000 | No | `104988e4afc5f7ee63e08c19ae4034d69ab3fde6` |
| `copilot/enhance-documentation-ci-cd` | Stale generated copilot/* branch | 2026-03-09 10:33:34 +0000 | No | `a7c28580b7e0568095135997b21c6fd46c10f992` |
| `copilot/fix-all-repos-issues` | Stale generated copilot/* branch | 2025-12-28 21:37:46 +0000 | No | `9cc9fca4efa9fb81530ede85e6a4b1e984b3db22` |
| `copilot/fix-application-error` | Stale generated copilot/* branch | 2026-02-23 04:01:51 +0000 | No | `a13167f3dfdc2e2322bb1ba441ffe2262ab099fd` |
| `copilot/fix-checks-issues` | Stale generated copilot/* branch | 2026-04-04 08:08:12 +0000 | No | `440dd7f027881c07f1bc5f2233fcb9f24ab1b433` |
| `copilot/fix-ci-cd-security-issues` | Stale generated copilot/* branch | 2026-03-06 03:56:55 +0000 | No | `e29d530e5ef17f178b19864bc15e758d2b785af6` |
| `copilot/fix-ci-test-issues` | Stale generated copilot/* branch | 2026-03-06 03:21:27 +0000 | No | `2d2426f1f7c553a8b038f9f35a7c3f71daa40124` |
| `copilot/fix-container-loading-issue` | Stale generated copilot/* branch | 2026-04-29 09:16:57 -0500 | No | `6cca9c6308b33f4da52bf29e39a4e0c61e3589a6` |
| `copilot/fix-deploy-yml-broken-code` | Stale generated copilot/* branch | 2026-04-20 01:27:05 -0500 | No | `689dce2bb10c2a1eccdc33a101372afe3242404a` |
| `copilot/fix-dns-resolution-issues` | Stale generated copilot/* branch | 2026-03-14 21:39:30 -0500 | No | `d543f436640941873fe1a4952ec682dc69e5593d` |
| `copilot/fix-docker-port-runtime-mismatch` | Stale generated copilot/* branch | 2026-04-27 08:23:54 +0000 | No | `55a74fb836e78c017fd3416a89b60ad874aeb747` |
| `copilot/fix-dual-js-ts-entry-points` | Stale generated copilot/* branch | 2026-03-18 09:11:58 -0500 | No | `152c9ad6ce0939cac639d9ad1ebadcd4092709a4` |
| `copilot/fix-harden-deployment-pipeline-again` | Stale generated copilot/* branch | 2026-03-31 10:28:28 +0000 | No | `bc93900c408de3e6c54e3d614faf9c6e9e18aa6b` |
| `copilot/fix-issue-with-freight-logging` | Stale generated copilot/* branch | 2025-12-27 20:44:13 +0000 | No | `e310adc630d52a7f34cc6c3f8c7086cd9f5e1f68` |
| `copilot/fix-issue-with-payment-processing` | Stale generated copilot/* branch | 2026-04-29 10:35:24 +0000 | No | `4b0e14013aaa17fd046fc0799a4c0ab69de96e2a` |
| `copilot/fix-mocks-paths-prisma-guards` | Stale generated copilot/* branch | 2026-03-08 23:53:32 +0000 | No | `57f2428511beeb7dd663190831716926820f8b3e` |
| `copilot/fix-order-processing-issue` | Stale generated copilot/* branch | 2025-12-29 06:29:21 +0000 | No | `81db5ba879d68741650bfdbee3509f323c8c1804` |
| `copilot/fix-pnpm-version-mismatch` | Stale generated copilot/* branch | 2026-04-04 08:32:05 +0000 | No | `71ebcaa45d0ce73939b4e9fd4577ce943263aac3` |
| `copilot/fix-route-calculation-error` | Stale generated copilot/* branch | 2026-04-25 00:01:17 -0500 | No | `ed7fadc48b21233361a0d16969ca25917abb4e09` |
| `copilot/fix-typo-in-documentation` | Stale generated copilot/* branch | 2026-04-29 11:06:41 -0500 | No | `7dcfd7993fff9e5edc7911e7eed539e4a52341e4` |
| `copilot/fix-typo-in-readme` | Stale generated copilot/* branch | 2025-12-29 01:42:29 +0000 | No | `88b703efc73e71037359f7b13101e258f9cdaa8c` |
| `copilot/improve-dependabot-automation` | Stale generated copilot/* branch | 2026-03-09 01:04:49 +0000 | No | `1ffc7bed829a04629d8681a6bc2624cdb8634b40` |
| `copilot/improve-documentation-structure` | Stale generated copilot/* branch | 2026-03-02 12:33:33 +0000 | No | `505bed047fb34bf5d9127507d9cc9edc20783ba9` |
| `copilot/launch-staging-validation-production-migration-che` | Stale generated copilot/* branch | 2026-04-27 09:24:10 +0000 | No | `4cdb4255b454a9658dbc9c17d1fa72d21bf689e2` |
| `copilot/mvp-build-carrier-approval-workflow` | Stale generated copilot/* branch | 2026-04-27 09:11:42 +0000 | No | `8d6b86538bc4866305cc75618703ec1dae383ff4` |
| `copilot/mvp-build-pod-upload-invoice-workflow` | Stale generated copilot/* branch | 2026-04-27 09:29:49 +0000 | No | `1104c4d1e3fad053f80e8ce752b9922c4a59bb0f` |
| `copilot/optimize-maintainability-security` | Stale generated copilot/* branch | 2026-03-09 10:09:31 +0000 | No | `a6c5145a2dd0d6b4efe9e1e0f8531ff9f22604b0` |
| `copilot/platform-wide-enterprise-hardening` | Stale generated copilot/* branch | 2026-03-16 06:58:39 -0500 | No | `bc4d6c9bafe14cda4f07f73ba3ffcb18e4c5684c` |
| `copilot/provide-production-readiness-evidence` | Stale generated copilot/* branch | 2026-04-27 09:06:29 +0000 | No | `d88e0af0a2641b84abf63824731d21a94c6b4515` |
| `copilot/recommendations-for-improvement` | Stale generated copilot/* branch | 2026-03-02 12:14:55 +0000 | No | `b3af3942aa927070beb093e99b163903dec2c884` |
| `copilot/reconcile-frontend-behavior` | Stale generated copilot/* branch | 2026-04-23 05:52:26 -0500 | No | `470c622d4e807b9779a6a2a6ce734d319c9a9acb` |
| `copilot/reference-github-action-run-73515665537` | Stale generated copilot/* branch | 2026-04-29 04:37:59 +0000 | No | `a56521e25f9ddbbd6a3d270f58c67a8cdcc591e0` |
| `copilot/reference-github-run-73515665121` | Stale generated copilot/* branch | 2026-04-29 04:35:50 +0000 | No | `971f2a7a9cdcc8b87981215ad2353c15997a84b5` |
| `copilot/replace-header-trusted-role-checks` | Stale generated copilot/* branch | 2026-04-27 08:31:30 +0000 | No | `ea96868b1b4766538243a3be2ddd5265c865724e` |
| `copilot/resolve-open-pull-requests` | Stale generated copilot/* branch | 2025-12-05 12:27:39 +0000 | No | `f722451c7569a216e9bf88750648cb2e90e188ba` |
| `copilot/restructure-repository-for-monorepo` | Stale generated copilot/* branch | 2026-03-09 12:00:34 +0000 | No | `8386d138344495eefbf22514b4d804be1d856960` |
| `copilot/review-code-quality-ci-cd` | Stale generated copilot/* branch | 2026-03-02 12:46:37 +0000 | No | `020af69b483ec2c9fa3e297071f0c9cc0f8aa21b` |
| `copilot/run-end-to-end-freight-workflow-test` | Stale generated copilot/* branch | 2026-04-27 08:47:45 +0000 | No | `657fcd4f192deb485049c31f95bd8871c6632d8c` |
| `copilot/sbom-runtime-build-split-rebased` | Stale generated copilot/* branch | 2026-04-23 04:22:13 -0500 | No | `caf5668dc6f2de7bcfb50eb78718edbbcaccc326` |
| `copilot/setup-hardening-for-infamous-freight` | Stale generated copilot/* branch | 2026-03-09 01:20:16 +0000 | No | `a612fa029df7ba0da0b1e49f3208a8315ad1e524` |
| `copilot/split-runtime-sbom-from-build-artifacts` | Stale generated copilot/* branch | 2026-04-23 05:25:42 -0500 | No | `2134a03c42ed2a725adfd00daef42f3851970a92` |
| `copilot/trigger-mvp-quote-workflow-validation` | Stale generated copilot/* branch | 2026-04-27 21:30:00 -0500 | No | `47e3145834b98022037fe9e269f5f5818e0154db` |
| `copilot/update-branch-1700` | Stale generated copilot/* branch | 2026-04-29 09:00:26 -0500 | No | `f3b6de715d2d2a45ca3f8f66b4777c03d0a0f7fb` |
| `copilot/update-branch-1708` | Stale generated copilot/* branch | 2026-04-29 12:04:39 -0500 | No | `391d6044461f1a2049082c462b804c2349443c74` |
| `copilot/update-cargo-handling-system` | Stale generated copilot/* branch | 2025-12-27 20:56:02 +0000 | No | `252ca406d26c1fc27a83e79a29f04fbb4ea3921d` |
| `copilot/update-ci-workflow` | Stale generated copilot/* branch | 2026-04-23 07:04:39 +0000 | No | `a25481dce89a7d35a607a50c4c5d7a92b79ec87a` |
| `copilot/update-commentary-formatting` | Stale generated copilot/* branch | 2025-12-29 01:58:52 +0000 | No | `58c7f6bac138429df4592b9025c974b2861ff321` |
| `copilot/update-commit-references` | Stale generated copilot/* branch | 2026-04-27 21:21:09 -0500 | No | `e3d08d2cc23b1d1f87c1fcd0fe98bad883fa4f6a` |
| `copilot/update-documentation` | Stale generated copilot/* branch | 2026-04-27 08:55:17 +0000 | No | `b204649e0e984965758f1804bb500ccaf4ab8e68` |
| `copilot/update-documentation-for-repo` | Stale generated copilot/* branch | 2025-12-27 20:44:33 +0000 | No | `49cde0d0430642c252019c5930f627f7eb23218a` |
| `copilot/update-freight-enterprise-data` | Stale generated copilot/* branch | 2025-12-29 06:28:48 +0000 | No | `2a1d705d597c7269e4bd0ef475f1bc84480ab13b` |
| `copilot/update-freight-invoice-format` | Stale generated copilot/* branch | 2025-12-27 20:55:01 +0000 | No | `00bbde6bb651993369aa2028e0458172032929ae` |
| `copilot/update-freight-management-system` | Stale generated copilot/* branch | 2025-12-27 20:43:00 +0000 | No | `7d09d3dad5251bdb87bb6110135fc24eea243a00` |
| `copilot/update-freight-management-system-again` | Stale generated copilot/* branch | 2025-12-27 21:00:30 +0000 | No | `b76ab77c782528733571315ff963c4440f80bda5` |
| `copilot/update-infamous-freight-safely` | Stale generated copilot/* branch | 2026-03-08 23:51:22 +0000 | No | `4a5121dbf24b5b508c7fe9bef2a4462f1914deaf` |
| `copilot/update-landing-page-design` | Stale generated copilot/* branch | 2026-04-27 17:39:30 +0000 | No | `cc1312ae096ff83447412e2690838c46d7366078` |
| `copilot/update-page-header-text` | Stale generated copilot/* branch | 2025-12-27 20:54:41 +0000 | No | `40973ac6d8de6e081ddf46fc0649cbd382e4cf7f` |
| `copilot/update-permissions-settings` | Stale generated copilot/* branch | 2025-12-29 01:01:26 +0000 | No | `41768215dcedf9ff1206c8bcef3d5011bf9d7b61` |
| `copilot/update-pnpm-version-to-10-15-0` | Stale generated copilot/* branch | 2026-04-04 09:53:13 +0000 | No | `cadd52d4ae82376cb5f731a8dae809b7ccd54d05` |
| `copilot/update-project-dependencies` | Stale generated copilot/* branch | 2026-04-27 17:39:30 +0000 | No | `cc1312ae096ff83447412e2690838c46d7366078` |
| `copilot/update-readme-file-again` | Stale generated copilot/* branch | 2025-12-28 00:52:34 +0000 | No | `9897b4cceeea618e33374079829b0a3b5363a864` |
| `copilot/update-readme-file-another-one` | Stale generated copilot/* branch | 2025-12-29 06:34:20 +0000 | No | `c6340f20ab991b1ce1e42c7432f5e8410ea12b9c` |
| `copilot/update-readme-for-clarity` | Stale generated copilot/* branch | 2026-04-27 17:39:30 +0000 | No | `cc1312ae096ff83447412e2690838c46d7366078` |
| `copilot/update-repo-config-to-match-production` | Stale generated copilot/* branch | 2026-04-23 09:46:44 +0000 | No | `a823196ba0e388d1692bb5de7d283ee4a694fa26` |
| `copilot/update-run-configuration` | Stale generated copilot/* branch | 2026-04-29 04:38:51 +0000 | No | `1ef769d24c1ff567278739d105c539e774c38abd` |
| `copilot/update-transportation-logic` | Stale generated copilot/* branch | 2026-04-28 19:53:10 -0500 | No | `7cec1e3be606da941db267a12ed2ce7fe75522a6` |
| `copilot/update-user-authentication` | Stale generated copilot/* branch | 2026-01-10 12:11:12 +0000 | No | `fc105f3d885d43c567c7566e773aa186d581ef57` |
| `copilot/validate-approved-quote-workflow-tests` | Stale generated copilot/* branch | 2026-04-27 17:35:24 +0000 | No | `186f5e96191888f9bc231e9c3e9360cf9a7163f1` |
| `copilot/validate-pagination-parameters` | Stale generated copilot/* branch | 2026-03-06 03:14:58 +0000 | No | `9162c734f1151a8e4374cc44f4ddb8274ba9cb08` |
| `github-advanced-security/debug-flow-issues` | Stale generated github-advanced-security/* branch | 2026-04-23 06:51:17 +0000 | No | `7bd1495ca8cf7772ac97d52d10204d53f6016704` |
| `github-advanced-security/fix-build-issues` | Stale generated github-advanced-security/* branch | 2026-04-23 06:51:17 +0000 | No | `7bd1495ca8cf7772ac97d52d10204d53f6016704` |
| `github-advanced-security/fix-database-connection-issue` | Stale generated github-advanced-security/* branch | 2026-04-23 06:51:17 +0000 | No | `7bd1495ca8cf7772ac97d52d10204d53f6016704` |
| `github-advanced-security/fix-issue-in-github-actions` | Stale generated github-advanced-security/* branch | 2026-04-23 01:42:30 -0500 | No | `64354d44c8af762aeb8a858b821c105e9945d8a4` |
| `github-advanced-security/fix-pr-1541-issues` | Stale generated github-advanced-security/* branch | 2026-04-24 06:16:41 -0500 | No | `1a87ba8fd56564486af229930ae208884ca0bb9d` |
| `github-advanced-security/fix-typo-in-documentation` | Stale generated github-advanced-security/* branch | 2026-04-23 05:08:19 -0500 | No | `61ab93a0fc2d0a7f52d465033104f17f6e1f376d` |
| `github-advanced-security/link-access-job-info` | Stale generated github-advanced-security/* branch | 2026-04-23 06:51:36 +0000 | No | `1b77f5e4fc9b8127479487c960c2e7e01e163cd6` |
| `github-advanced-security/update-dependency-version` | Stale generated github-advanced-security/* branch | 2026-04-23 09:04:14 +0000 | No | `bbcc1a1f824f66e79b993f8732fbc20b248cca90` |
| `github-advanced-security/update-freight-calculation-logic` | Stale generated github-advanced-security/* branch | 2026-04-23 06:51:36 +0000 | No | `1b77f5e4fc9b8127479487c960c2e7e01e163cd6` |

## Deletion Actions

- Attempted deletion for 155 safe candidates using `git push origin --delete <branch>`.
- Deletion attempts failed for 155 branches due to missing GitHub credentials in this environment (`could not read Username for https://github.com`).

## Deleted Branches

- None (all remote deletion attempts failed authentication).

## Skipped Branches

- `billing/payment-method-configuration` (`82d725a9a849dd7df9a0a7f6998f576c428b28d4`): kept — Updated in last 7 days.
- `chatgpt/launch-readiness-pass-20260405` (`8e0aadb2113e8d0b8e1e663190da40a0eed07b06`): kept — Not clearly safe.
- `chatgpt/stripe-billing-unify-2026-04-08` (`863bf907ebf02fbcbfc328022267347be9305372`): kept — Not clearly safe.
- `chatgpt/supabase-web-cutover` (`7a2273bc36d71887539447f74e70f1930fe597ea`): kept — Not clearly safe.
- `chore/docker-rebuild` (`9df077a90f31761d57825a7b8729adad5e7c184c`): kept — Not clearly safe.
- `chore/env-provision-upload-20260408` (`19abff25f0d34313b358a51ef455d9f4ac598ea2`): kept — Not clearly safe.
- `chore/repo-hardening` (`9802e5f1de5f90d1aee4d7f3b79de80f2791bd17`): kept — Not clearly safe.
- `codex/infamous-add-deployment-scripts-and-documentation-2026-05-01` (`253fbc182b4fd822bc44310364defeeff50ec9a6`): kept — Updated in last 7 days.
- `codex/infamous-add-infamous-freight-tools-2026-05-01` (`739d34fcae2ef1301d8cd22cd7853fd83f119ab5`): kept — Updated in last 7 days.
- `codex/infamous-add-paypal-and-ad-integration-2026-05-01` (`591b75fbd5a3b0b6b329d75a61f69a62b88fee72`): kept — Updated in last 7 days.
- `codex/infamous-build-ai-freight-operating-system-2026-05-04` (`89e2d781b03624ecf5751bb433e480bac54eb9b4`): kept — Updated in last 7 days.
- `codex/infamous-create-txt-record-for-hostname-2026-05-01` (`8f269efee13e1e33173784a89bf9e3046b31a1b8`): kept — Updated in last 7 days.
- `codex/infamous-define-freight-monetization-strategy-2026-05-01` (`fe01e55c9f77ebbfaa281d12562dd1030342d58f`): kept — Updated in last 7 days.
- `codex/infamous-document-completed-stripe/github-updates-2026-05-05` (`527f8d29818e362f99acb666b0d8464825472a50`): kept — Updated in last 7 days.
- `codex/infamous-document-fly.io-deployment-process-2026-05-01` (`08a03544567c3dce35984e71c4c33a6cdce6e5cf`): kept — Updated in last 7 days.
- `codex/infamous-document-process-for-obtaining-environment-variables-2026-05-02` (`2927c0ba9adbac0a0790153c638088d5328c0f7e`): kept — Updated in last 7 days.
- `codex/infamous-fix-docker-image-not-found-error-2026-05-02` (`0e0c06da3f3299897f2e265efd131012b68553e6`): kept — Updated in last 7 days.
- `codex/infamous-fix-sentry-upload-token-error-2026-05-06` (`e5ef2b7ccf00a3d0585f19fa0fbf7c648d35106b`): kept — Updated in last 7 days.
- `codex/infamous-identify-sentry-project-configuration-2026-04-30` (`86b74defa7a136aeffdc4587ed30a4da3942f9f7`): kept — Updated in last 7 days.
- `codex/infamous-pull-docker-image-from-github-registry-2026-05-07` (`5b5f724a2035a13a3b1fbb8a9eecb9d52c86d51f`): kept — Updated in last 7 days.
- `codex/infamous-review-recommendations-for-infamous-freight-2026-04-30` (`3c0d07eb409b18e6769ba65f525b68d6efd1ac04`): kept — Updated in last 7 days.
- `codex/infamous-run-netlify-mcp-with-site-id-2026-04-30` (`eef22544c722b23e4d3a2061b2f759f6d9d1b6be`): kept — Updated in last 7 days.
- `codex/infamous-run-netlify-mcp-with-site-id-2026-04-30-lvu1er` (`5fe4e5e05c869bf522adcd08dc6bc812ca540098`): kept — Updated in last 7 days.
- `copilot/add-new-action-step` (`4d430a00c26676cfd6d0cc926098918343dd847c`): kept — Updated in last 7 days.
- `copilot/add-test-cases-for-integration` (`efb43aa038f53b9aa974fb696ef6fa7bad00625b`): kept — Updated in last 7 days.
- `copilot/ai-failure-analysis` (`978dc2c01009d03b14324290dacd16f3f6b6039b`): kept — Updated in last 7 days.
- `copilot/audit-github-infamous-freight` (`6dbdecb92a7b1a97d62d3dda4807f133c5fc3adf`): kept — Updated in last 7 days.
- `copilot/audit-infamous-freight` (`ef8289e6c7db09e5ec014d4fcf808b77377b76fe`): kept — Updated in last 7 days.
- `copilot/audit-infamous-freight-again` (`01deb29308a01d9a3497d07c949c94bd9cef02c1`): kept — Updated in last 7 days.
- `copilot/codexinfamous-rebase-feature-branch-onto-main-2026` (`6dbdecb92a7b1a97d62d3dda4807f133c5fc3adf`): kept — Updated in last 7 days.
- `copilot/confirm-quote-intake-workflow` (`ed35bd6f83aad1abd705e8a01943c207807290f7`): kept — Updated in last 7 days.
- `copilot/create-implementation-plan` (`390140165e264777b5d1e4d73bbc3f8d5535fdc1`): kept — Updated in last 7 days.
- `copilot/enhance-ai-guardrails-hardening` (`e4ffd6c86b155f860c9112e47fd064c3ab12ed2f`): kept — Updated in last 7 days.
- `copilot/explain-repository-structure` (`390140165e264777b5d1e4d73bbc3f8d5535fdc1`): kept — Updated in last 7 days.
- `copilot/fix-bug-in-shipping-module` (`7121a00c4582a8ecbce36141407e1407a3a58e74`): kept — Updated in last 7 days.
- `copilot/fix-check-suite-errors` (`eca4663d4b0e9bd4ba085b2932e6f9973efda2d2`): kept — Updated in last 7 days.
- `copilot/fix-commit-check-issues` (`464a906c28b900983fe736ed826b19a359234025`): kept — Updated in last 7 days.
- `copilot/fix-invoice-processing-error` (`fe01e55c9f77ebbfaa281d12562dd1030342d58f`): kept — Updated in last 7 days.
- `copilot/fix-memory-leak-issue` (`3c0d07eb409b18e6769ba65f525b68d6efd1ac04`): kept — Updated in last 7 days.
- `copilot/fix-order-processing-error` (`fe01e55c9f77ebbfaa281d12562dd1030342d58f`): kept — Updated in last 7 days.
- `copilot/fix-payment-processing-bug` (`591b75fbd5a3b0b6b329d75a61f69a62b88fee72`): kept — Updated in last 7 days.
- `copilot/fix-retrieve-shipment-issue` (`696c2c581a6d989ab4ca6cbb87799f3ab0ed2a67`): kept — Updated in last 7 days.
- `copilot/fix-runtime-error-in-invoice-module` (`e5a1923178e80d8dbfb672ff02a2e856b1f1fcd7`): kept — Updated in last 7 days.
- `copilot/fix-syntax-error-in-handler` (`3e9678c80c003e324f7ff87ee120f25c9783e242`): kept — Updated in last 7 days.
- `copilot/fix-typo-in-documentation-again` (`0e0c06da3f3299897f2e265efd131012b68553e6`): kept — Updated in last 7 days.
- `copilot/fix-typo-in-documentation-another-one` (`97754be1262e48688d989795a45ce4553fed956f`): kept — Updated in last 7 days.
- `copilot/fix-typo-in-readme-again` (`c808e7e1e1f0182c6ec970e9f19d900bae241d74`): kept — Updated in last 7 days.
- `copilot/fix-user-authentication-issue` (`aa7cb9eb2ccbb4dbf60bb9338bbd6a956f158e4c`): kept — Updated in last 7 days.
- `copilot/improve-markdown-rendering` (`93b9a3c2c395d2b778c40df9c9a2d71396c391fd`): kept — Updated in last 7 days.
- `copilot/infamous-freight-recommendations` (`09f929c52d118bee87303243034b18367545bfef`): kept — Updated in last 7 days.
- `copilot/no-code-changes-required` (`6dbdecb92a7b1a97d62d3dda4807f133c5fc3adf`): kept — Updated in last 7 days.
- `copilot/rebase-branch` (`fd1d1427ef960ee5d0757d29dd7f6ed6e6dfe79c`): kept — Updated in last 7 days.
- `copilot/rebase-branch-again` (`390140165e264777b5d1e4d73bbc3f8d5535fdc1`): kept — Updated in last 7 days.
- `copilot/recommendations-implementation` (`390140165e264777b5d1e4d73bbc3f8d5535fdc1`): kept — Updated in last 7 days.
- `copilot/reference-checks-update` (`dcc281f2125d76124b51b15cb2dbb1406c77b6be`): kept — Updated in last 7 days.
- `copilot/update-action-reference` (`4d430a00c26676cfd6d0cc926098918343dd847c`): kept — Updated in last 7 days.
- `copilot/update-authentication-methods` (`86b74defa7a136aeffdc4587ed30a4da3942f9f7`): kept — Updated in last 7 days.
- `copilot/update-auto-ci-cd-workflow` (`978dc2c01009d03b14324290dacd16f3f6b6039b`): kept — Updated in last 7 days.
- `copilot/update-auto-self-healing-workflow` (`978dc2c01009d03b14324290dacd16f3f6b6039b`): kept — Updated in last 7 days.
- `copilot/update-checks-for-commit-53e1b9d` (`e370e48fe0c4400c3d4a0df854a8a7777ff5d785`): kept — Updated in last 7 days.
- `copilot/update-checks-for-commit-53e1b9d-again` (`3ea014b77dcdca3db9af5e6b704fc30be5f88c01`): kept — Updated in last 7 days.
- `copilot/update-checks-for-commit-53e1b9d-another-one` (`53e1b9da128f5cdbd536fcee2c310126d287d142`): kept — Updated in last 7 days.
- `copilot/update-checks-for-commit-deeb815` (`041163d58ff7f9e462584a004e7a7bfafba8c138`): kept — Updated in last 7 days.
- `copilot/update-customer-shipping-details` (`866f8a73e6b7f5c69298a657290b859db320c36c`): kept — Updated in last 7 days.
- `copilot/update-dependabot-automerge-workflow` (`978dc2c01009d03b14324290dacd16f3f6b6039b`): kept — Updated in last 7 days.
- `copilot/update-dependencies` (`390140165e264777b5d1e4d73bbc3f8d5535fdc1`): kept — Updated in last 7 days.
- `copilot/update-deployment-configurations` (`4d430a00c26676cfd6d0cc926098918343dd847c`): kept — Updated in last 7 days.
- `copilot/update-documentation-for-api` (`55742edfdb0709dc8ccafadf0ffa8071512042ec`): kept — Updated in last 7 days.
- `copilot/update-documentation-for-api-endpoints` (`23cca1cc0fe32d120b418d34e71893afe9f7d2b7`): kept — Updated in last 7 days.
- `copilot/update-documentation-for-installation` (`0c3c2e2c24e60d61efc4dce425d914fc6c207a3a`): kept — Updated in last 7 days.
- `copilot/update-netlify-mcp-deploy-command` (`58d3543e283213ef62bc550cbd264f40bf5c4594`): kept — Updated in last 7 days.
- `copilot/update-pr-template` (`aa7cb9eb2ccbb4dbf60bb9338bbd6a956f158e4c`): kept — Updated in last 7 days.
- `copilot/update-readme-with-contribution-guidelines` (`f89898227f15b4d7ca8153d6e3c6533579df58c0`): kept — Updated in last 7 days.
- `copilot/update-readme-with-sample-data` (`5a83d89eb38ce5d8f6c4a7fbe30212c5f16ca5ef`): kept — Updated in last 7 days.
- `copilot/update-sentry-source-map-upload` (`730da638f4548a3e134025136e5fdae7babd6908`): kept — Updated in last 7 days.
- `dependabot/npm_and_yarn/apps/web/dot-netlify/plugins/npm_and_yarn-55a47811c2` (`fc43146d3daf0918385510a170bc5471e38dbfb7`): kept — Updated in last 7 days.
- `docs/local-infra-readme` (`acecbd21f1c8ec1361dd19852fd09cebf97dacad`): kept — Not clearly safe.
- `docs/products-overview` (`3c258afaa77a0d3605d1c7505dbe77b0c634f89b`): kept — Not clearly safe.
- `feat/launch-readiness-pack` (`8e0aadb2113e8d0b8e1e663190da40a0eed07b06`): kept — Not clearly safe.
- `fix-netlify-next-build` (`170a88db343a3d9be527f0a1dd501ef8585c90a8`): kept — Not clearly safe.
- `fix/ai-workers-hardening` (`69945bf97ef9aa65e8f15cec86307e4e743acb83`): kept — Not clearly safe.
- `fix/ci-pnpm-and-secret-gating` (`8a087dba004d7f3b6517d5a7ace3409b7325f220`): kept — Not clearly safe.
- `fix/web-build-blockers-apr20-2026` (`8c910d4271dbb56e3742735a186f4af0544fc48f`): kept — Not clearly safe.
- `flyio-new-files` (`aa7cb9eb2ccbb4dbf60bb9338bbd6a956f158e4c`): kept — Updated in last 7 days.
- `infamous-reliability-agents` (`bce36b153d05d91862f2d203620b64aea461c0c2`): kept — Not clearly safe.
- `local-infra-smoke` (`4b1cc3a7ac2601a5fcb9741175c5a3d609438684`): kept — Not clearly safe.
- `main` (`f353ff6e8b4cbf60489df011c065df1fcd050b56`): kept — Protected/default branch kept.
- `phase1b` (`fe5966073bf95bde2684572837a89b69cdf42485`): kept — Updated in last 7 days.
- `update-toolchain` (`472eb949dc84a9c03ee56eb222c62d808ae5027f`): kept — Not clearly safe.
- `vercel/install-vercel-web-analytics-mxvtxf` (`061c9d2979884ad8475b778c782dcd89e07bb6d7`): kept — Not clearly safe.
