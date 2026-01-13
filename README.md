# Kasoku

[日本語](README.ja.md)

A VSCode extension that accelerates your development workflow with productivity-boosting features.

## Features

### Copy Path with Line Number

Quickly copy file paths with line numbers to your clipboard from the context menu.

- **Copy Relative Path with Line Number** - Copies the relative path from workspace root

  - Example: `src/index.ts:42`

- **Copy Absolute Path with Line Number** - Copies the absolute file path
  - Example: `/path/to/project/src/index.ts:42`

#### Usage

1. Open any file in VSCode
2. Place your cursor on the line you want to reference
3. Right-click to open the context menu
4. Select either:
   - "Copy Relative Path with Line Number"
   - "Copy Absolute Path with Line Number"

You can also access these commands via the Command Palette (Cmd+Shift+P / Ctrl+Shift+P).

## Localization

This extension supports the following languages:

- English (default)
- Japanese (日本語)

The UI language is automatically selected based on your VSCode language settings.

## License

MIT
