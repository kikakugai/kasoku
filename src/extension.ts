import * as vscode from "vscode"

/**
 * エディタのコンテキスト情報を取得する
 *
 * @description アクティブなエディタから、ファイルURI、現在の行番号を取得します。
 * エディタが開かれていない場合や、未保存ファイルの場合はnullを返します。
 *
 * @returns エディタコンテキスト情報、または取得できない場合はnull
 */
function getEditorContext(): {
  editor: vscode.TextEditor
  fileUri: vscode.Uri
  lineNumber: number
} | null {
  const editor = vscode.window.activeTextEditor

  if (!editor) {
    vscode.window.showWarningMessage(vscode.l10n.t("No active editor"))
    return null
  }

  const fileUri = editor.document.uri

  // 未保存ファイル（untitled）の場合は警告を表示
  if (fileUri.scheme === "untitled") {
    vscode.window.showWarningMessage(
      vscode.l10n.t(
        "Cannot copy path for unsaved file. Please save the file first."
      )
    )
    return null
  }

  // 行番号を取得（0ベース → 1ベースに変換）
  const lineNumber = editor.selection.active.line + 1

  return { editor, fileUri, lineNumber }
}

/**
 * パスと行番号を結合した文字列を生成する
 *
 * @description パスのタイプ（相対または絶対）に応じて、ファイルパスと行番号を
 * 結合した文字列を生成します。
 *
 * @param fileUri - ファイルのURI
 * @param lineNumber - 行番号（1ベース）
 * @param pathType - パスのタイプ（'relative' または 'absolute'）
 * @returns パス:行番号の形式の文字列（例: src/index.ts:42）
 *
 * @example
 * ```typescript
 * // 相対パスの場合
 * const relativePath = buildPathWithLine(uri, 42, 'relative');
 * // => "src/index.ts:42"
 *
 * // 絶対パスの場合
 * const absolutePath = buildPathWithLine(uri, 42, 'absolute');
 * // => "/path/to/project/src/index.ts:42"
 * ```
 */
function buildPathWithLine(
  fileUri: vscode.Uri,
  lineNumber: number,
  pathType: "relative" | "absolute"
): string {
  let filePath: string

  if (pathType === "relative") {
    // ワークスペースからの相対パスを取得
    filePath = vscode.workspace.asRelativePath(fileUri)
  } else {
    // 絶対パスを取得（ネイティブファイルシステムパス）
    filePath = fileUri.fsPath
  }

  // 行番号の検証（安全のため）
  const validLineNumber = Math.max(1, Math.floor(lineNumber))

  return `${filePath}:${validLineNumber}`
}

/**
 * テキストをクリップボードにコピーする
 *
 * @description 指定されたテキストをクリップボードにコピーし、
 * ユーザーに成功メッセージを表示します。
 *
 * @param text - クリップボードにコピーするテキスト
 */
async function copyToClipboard(text: string): Promise<void> {
  try {
    await vscode.env.clipboard.writeText(text)
    vscode.window.showInformationMessage(vscode.l10n.t("Copied: {0}", text))
  } catch (error) {
    vscode.window.showErrorMessage(
      vscode.l10n.t("Failed to copy to clipboard: {0}", String(error))
    )
  }
}

/**
 * 相対パスと行番号をクリップボードにコピーするコマンド
 *
 * @description 現在のカーソル位置の相対パスと行番号を
 * "相対パス:行番号"の形式でクリップボードにコピーします。
 *
 * @example
 * // カーソルが src/index.ts の 42行目にある場合
 * // クリップボードには "src/index.ts:42" がコピーされる
 */
export async function copyRelativePathWithLine(): Promise<void> {
  const context = getEditorContext()
  if (!context) {
    return
  }

  const pathWithLine = buildPathWithLine(
    context.fileUri,
    context.lineNumber,
    "relative"
  )

  await copyToClipboard(pathWithLine)
}

/**
 * 絶対パスと行番号をクリップボードにコピーするコマンド
 *
 * @description 現在のカーソル位置の絶対パスと行番号を
 * "絶対パス:行番号"の形式でクリップボードにコピーします。
 *
 * @example
 * // カーソルが src/index.ts の 42行目にある場合
 * // クリップボードには "/path/to/project/src/index.ts:42" がコピーされる
 */
export async function copyAbsolutePathWithLine(): Promise<void> {
  const context = getEditorContext()
  if (!context) {
    return
  }

  const pathWithLine = buildPathWithLine(
    context.fileUri,
    context.lineNumber,
    "absolute"
  )

  await copyToClipboard(pathWithLine)
}

/**
 * 拡張機能のアクティベーション関数
 *
 * @description VSCodeが拡張機能をアクティベートするときに呼び出されます。
 * 2つのコマンドを登録します：
 * - copyPath.copyRelativePathWithLine: 相対パスをコピー
 * - copyPath.copyAbsolutePathWithLine: 絶対パスをコピー
 *
 * @param context - 拡張機能のコンテキスト
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('Extension "kasoku" is now active')

  // 相対パスをコピーするコマンドを登録
  const relativePathCommand = vscode.commands.registerCommand(
    "copyPath.copyRelativePathWithLine",
    copyRelativePathWithLine
  )

  // 絶対パスをコピーするコマンドを登録
  const absolutePathCommand = vscode.commands.registerCommand(
    "copyPath.copyAbsolutePathWithLine",
    copyAbsolutePathWithLine
  )

  // コマンドをサブスクリプションに追加（自動クリーンアップのため）
  context.subscriptions.push(relativePathCommand, absolutePathCommand)
}

/**
 * 拡張機能のディアクティベーション関数
 *
 * @description VSCodeが拡張機能をディアクティベートするときに呼び出されます。
 * 現在は特別なクリーンアップ処理は不要です。
 */
export function deactivate(): void {
  console.log('Extension "kasoku" is now deactivated')
}
