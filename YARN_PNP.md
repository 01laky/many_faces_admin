# Yarn Berry with PnP (Plug'n'Play)

This project uses **Yarn Berry (v4)** with **PnP (Plug'n'Play)** instead of traditional `node_modules`.

## What is PnP?

PnP (Plug'n'Play) is Yarn's modern approach to dependency management that:

- **Eliminates `node_modules`** - No more huge `node_modules` folders
- **Faster installs** - Dependencies are stored in `.yarn/cache` as zip files
- **Better security** - Strict dependency resolution prevents phantom dependencies
- **Smaller disk usage** - Shared cache across projects
- **Deterministic builds** - Same dependencies every time

## Key Files

- `.yarnrc.yml` - Yarn configuration
- `.pnp.cjs` - PnP runtime (auto-generated, should be committed)
- `.yarn/cache/` - Dependency cache (should be committed for zero-installs)
- `.yarn/releases/` - Yarn binary (should be committed)

## Commands

All npm commands are replaced with yarn:

```bash
# Install dependencies
yarn install

# Add a dependency
yarn add <package>

# Add a dev dependency
yarn add -D <package>

# Remove a dependency
yarn remove <package>

# Run scripts
yarn dev
yarn build
yarn lint
yarn validate

# Update dependencies
yarn upgrade
```

## IDE Support

### VS Code

Run this command to set up VS Code for PnP:

```bash
yarn dlx @yarnpkg/sdks vscode
```

This will:

- Install TypeScript SDK
- Configure ESLint
- Set up the workspace

### Other IDEs

Most modern IDEs support PnP through the `.pnp.cjs` file. If you encounter issues:

1. Make sure your IDE is using the TypeScript version from `.yarn/sdks/typescript`
2. Check that ESLint is configured to use the PnP resolver

## Troubleshooting

### "Cannot find module" errors

If you see module resolution errors:

1. Make sure `.pnp.cjs` exists
2. Run `yarn install` to regenerate it
3. Restart your IDE/editor

### Vite/TypeScript not finding modules

Vite and TypeScript should work automatically with PnP. If not:

1. Check that `vite.config.ts` has PnP support (already configured)
2. Restart the dev server
3. Clear cache: `yarn cache clean`

### Peer dependency warnings

Some packages may show peer dependency warnings. This is usually safe to ignore, but you can:

- Add missing peer dependencies: `yarn add -D <package>`
- Check with: `yarn explain peer-requirements`

### Last resort: switch to `node_modules` linker

If your editor still cannot resolve modules with PnP after `yarn dlx @yarnpkg/sdks vscode` and a TS server restart:

1. In `.yarnrc.yml`, set `nodeLinker: node-modules`.
2. Run `yarn install`.
3. Remove PnP-only overrides from `.vscode/settings.json` if you added any, then restart the TypeScript server.

You still use Yarn Berry for installs; only the on-disk layout changes.

## Benefits

✅ **No `node_modules`** - Cleaner project structure  
✅ **Faster installs** - Typically 2-3x faster than npm  
✅ **Better security** - Prevents phantom dependencies  
✅ **Smaller size** - Shared cache, compressed packages  
✅ **Deterministic** - Same dependencies every time  
✅ **Zero-installs** - Can commit cache for instant installs

## Migration Notes

- All `npm` commands → `yarn` commands
- `package-lock.json` → `yarn.lock` (auto-generated)
- `node_modules/` → `.yarn/cache/` + `.pnp.cjs`

## Resources

- [Yarn Documentation](https://yarnpkg.com/)
- [PnP Documentation](https://yarnpkg.com/features/pnp)
- [Zero-Installs](https://yarnpkg.com/features/zero-installs)
