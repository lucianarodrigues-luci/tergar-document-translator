# Tergar Document Translator

Google Apps Scripts that translate an active Google Document and export the
translated copies as PDFs.

The translated Google Documents and PDFs are saved in the same Google Drive
folder as the original document. The source document is assumed to be in
English.

## Available scripts

| Script | Languages | Function to run |
| --- | --- | --- |
| `src/translateAndExportDoc-es-pt.gs` | Spanish and Brazilian Portuguese | `translateAndExportDocEsPt()` |
| `src/translateAndExportDoc-zh-ja-ru.gs` | Chinese, Japanese, and Russian | `translateAndExportDocZhJaRu()` |

Both scripts preserve the original font, size, bold, italic, color, links,
alignment, and paragraph layout as closely as Google Docs allows.

## Quick use

1. Open the source document in Google Docs.
2. Select **Extensions > Apps Script**.
3. Create a `.gs` file and paste the desired script into it.
4. Save the Apps Script project.
5. Select the relevant function and click **Run**.
6. Authorize access to Google Docs, Google Drive, and external requests.
7. Check the same Drive folder as the original document for the translated
   Google Docs and PDFs.

See [`docs/USAGE.md`](docs/USAGE.md) for detailed instructions.

## Important limitations

- Translation is automated and must be reviewed by a qualified human translator.
- Running a script again creates additional files with the same names.
- Large documents may exceed Google Apps Script execution or translation quotas.
- The scripts translate paragraphs, list items, and first-level content in tables.
- Actual execution must happen in Google Apps Script because the code depends on
  Google services such as `DocumentApp`, `DriveApp`, and `LanguageApp`.

## Privacy

Do not commit student information, source documents, access tokens, passwords,
or other confidential data to this repository.
