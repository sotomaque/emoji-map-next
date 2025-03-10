# Git Hooks

This directory contains Git hooks for the Emoji Map project. These hooks help ensure code quality and prevent pushing broken code to the repository.

## Available Hooks

### pre-push

The `pre-push` hook runs before pushing changes to the remote repository. It performs the following checks:

1. **Precheck**: Runs formatting, linting, type checking, and tests to ensure code quality.
2. **Build**: Builds the project to ensure it compiles successfully.

If any of these checks fail, the push will be aborted, and you'll need to fix the issues before pushing again.

## Skipping Hooks

In rare cases, you may need to bypass the hooks (not recommended). You can do this by adding the `--no-verify` flag to your Git command:

```bash
git push --no-verify
```

## Adding New Hooks

To add a new hook:

1. Create a new file in the `.husky` directory with the name of the hook (e.g., `pre-commit`).
2. Make it executable with `chmod +x .husky/pre-commit`.
3. Add the hook script, starting with:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Your hook commands here
```

## Troubleshooting

If you encounter issues with the hooks:

1. Make sure the hook files are executable (`chmod +x .husky/*`).
2. Check that husky is installed (`pnpm install`).
3. Verify that the hook scripts have the correct path to the husky.sh file.

## Updating Hooks

To update an existing hook, simply edit the hook file in the `.husky` directory. 