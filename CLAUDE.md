# Instructions for Claude Code

## Project purpose

This repository contains Google Apps Scripts used by Tergar International to
create preliminary AI-generated translations of English Google Documents and
export them as PDFs.

## Project structure

- `src/translateAndExportDoc-es-pt.gs`: Spanish and Brazilian Portuguese.
- `src/translateAndExportDoc-zh-ja-ru.gs`: Chinese, Japanese, and Russian.
- `appsscript.json`: Google Apps Script manifest.
- `docs/USAGE.md`: installation and operating instructions.

## Requirements that must be preserved

1. The source document is the active Google Document.
2. Output files must be saved in the source document's Drive folder.
3. Each translated Google Document must also be exported as a PDF.
4. All original document formatting must be preserved as closely as possible,
   especially font family, font size, bold, italic, color, links, paragraph
   alignment, tables, and list formatting.
5. Each language must receive the matching disclaimer from `FOOTER_TEXTS`.
6. Do not change approved disclaimer wording without explicit instruction.
7. Do not add API keys, tokens, document IDs, or private data to the repository.
8. Keep the two public entry functions unique:
   - `translateAndExportDocEsPt()`
   - `translateAndExportDocZhJaRu()`

## Working rules

- Explain a proposed change before making a major architectural modification.
- Keep the scripts compatible with the Google Apps Script V8 runtime.
- Validate JavaScript syntax after editing.
- Do not claim the scripts were fully tested locally: Google service calls must
  be tested inside Google Apps Script.
- Update `README.md` and `docs/USAGE.md` when behavior or setup changes.
- Before completing a task, show the files changed and summarize possible risks.

## Recommended first task

Review both scripts for duplicated code, formatting preservation, execution
limits, and error handling. Propose improvements before applying changes that
would alter output behavior.
