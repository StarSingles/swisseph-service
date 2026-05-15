# Upstream Swiss Ephemeris

Pinned to tag v2.10.3final of <https://github.com/aloistr/swisseph>.

This is a git sub-submodule. To update:

```bash
cd upstream/swisseph
git fetch --tags
git checkout <new-tag>
cd ../..
git add upstream/swisseph
git commit -m "chore: bump swisseph to <new-tag>"
pnpm wasm:build
pnpm test                # golden fixtures must still pass
```

**Never track `master`.** Bumps are deliberate, paired with re-running golden fixtures.
