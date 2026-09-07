# Usage Guide

## Install manually in Google Apps Script

1. Open the English source document in Google Docs.
2. Select **Extensions > Apps Script**.
3. Delete placeholder code only if it is not needed.
4. Create two script files in the Apps Script editor:
   - `translateAndExportDoc-es-pt`
   - `translateAndExportDoc-zh-ja-ru`
5. Copy the corresponding file contents from the local `src` folder.
6. Save the project.

## Run Spanish and Portuguese

Select and run:

```javascript
translateAndExportDocEsPt()
```

Expected output suffixes:

- `-es_ES`
- `-pt_BR`

## Run Chinese, Japanese, and Russian

Select and run:

```javascript
translateAndExportDocZhJaRu()
```

Expected output suffixes:

- `-zh_HK`
- `-ja_JP`
- `-ru_RU`

## First-run authorization

Google may request permission to:

- Read and edit the active Google Document.
- Create files in Google Drive.
- Make an authenticated request to export PDFs.

Review the requested permissions and authorize the script only under the
appropriate Tergar account.

## Validate the result

For every translated document, check:

1. Title font, size, alignment, and italic or bold styling.
2. Speaker or author names.
3. Paragraph order and spacing.
4. Bullet and numbered lists.
5. Tables.
6. Footer language and formatting.
7. Page breaks and PDF pagination.
8. Whether a human translator has reviewed the automated translation.

## Known limitations

- Re-running a function creates duplicates; it does not overwrite old output.
- Complex nested tables or unsupported embedded elements may remain untranslated.
- Translation and script runtime quotas may interrupt very large documents.
- Local tools can validate JavaScript syntax but cannot execute Google services.

## Work locally with Claude Code

Open Terminal and enter the project directory:

```bash
cd ~/Documents/tergar-document-translator
claude
```

Claude automatically reads `CLAUDE.md` for project-specific instructions.

Before accepting changes, inspect them:

```bash
git status
git diff
```
