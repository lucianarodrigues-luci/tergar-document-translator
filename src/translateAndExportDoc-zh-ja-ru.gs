/**
 * Creates Chinese, Japanese, and Russian copies of the active Google Doc,
 * adds a localized disclaimer to each footer, and exports the copies as PDF.
 *
 * The translated Google Docs and PDFs are saved in the same Drive folder as
 * the original document. The source document is assumed to be in English.
 */
function translateAndExportDocZhJaRu() {
  const ORIGINAL_DOC_ID = DocumentApp.getActiveDocument().getId();

  const TRANSLATIONS = {
    zh_HK: "zh",
    ja_JP: "ja",
    ru_RU: "ru"
  };

  const FOOTER_TEXTS = {
    zh_HK:
      "该记录是一份由人工智能生成的临时文件，可能包含不准确的内容。本资料为德噶国际所有，仅供德噶禅修教师课程使用。未经授权，严禁复制、分发或在德噶禅修教师课程之外使用。",
    ja_JP:
      "このトランスクリプトは暫定的な AI 生成文書であり、不正確な部分が含まれている可能性があります。本資料はTergar Internationalの所有物であり、Tergar瞑想教師プログラム内での使用のみを目的としています。Tergar瞑想教師プログラム以外での無断複製、配布、または使用は固く禁じられています。",
    ru_RU:
      "Данная стенограмма является предварительным документом, созданным с помощью искусственного интеллекта, и может содержать неточности. Он является собственностью компании Tergar International и предназначен исключительно для использования в рамках программы подготовки учителей медитации Tergar. Несанкционированное копирование, распространение или использование за пределами программы подготовки учителей медитации Tergar строго запрещено."
  };

  const originalFile = DriveApp.getFileById(ORIGINAL_DOC_ID);
  const folders = originalFile.getParents();

  if (!folders.hasNext()) {
    throw new Error("Original document is not in any folder.");
  }

  const folder = folders.next();

  /**
   * Translates the text children of a paragraph or list item while preserving
   * every formatting run (font, size, bold, italic, color, link, etc.).
   */
  function translateTextChildren_(container, lang) {
    const numberOfChildren = container.getNumChildren();

    for (let index = 0; index < numberOfChildren; index++) {
      const child = container.getChild(index);

      if (child.getType() !== DocumentApp.ElementType.TEXT) {
        continue;
      }

      const textElement = child.asText();
      const originalText = textElement.getText();

      if (originalText.trim() === "") {
        continue;
      }

      const attributeIndices = textElement.getTextAttributeIndices();
      const translatedRuns = [];

      for (let runIndex = 0; runIndex < attributeIndices.length; runIndex++) {
        const start = attributeIndices[runIndex];
        const end =
          runIndex + 1 < attributeIndices.length
            ? attributeIndices[runIndex + 1]
            : originalText.length;

        const runText = originalText.substring(start, end);
        const whitespaceMatch = runText.match(/^(\s*)([\s\S]*?)(\s*)$/);
        const leadingWhitespace = whitespaceMatch[1];
        const content = whitespaceMatch[2];
        const trailingWhitespace = whitespaceMatch[3];

        const translatedContent =
          content === ""
            ? ""
            : LanguageApp.translate(content, "en", lang);

        translatedRuns.push({
          text: leadingWhitespace + translatedContent + trailingWhitespace,
          attributes: textElement.getAttributes(start)
        });
      }

      const completeTranslation = translatedRuns
        .map(function (run) {
          return run.text;
        })
        .join("");

      textElement.setText(completeTranslation);

      let translatedPosition = 0;

      translatedRuns.forEach(function (run) {
        if (run.text.length > 0) {
          textElement.setAttributes(
            translatedPosition,
            translatedPosition + run.text.length - 1,
            run.attributes
          );
        }

        translatedPosition += run.text.length;
      });
    }
  }

  /**
   * Translates paragraphs and list items contained directly in a table cell.
   */
  function translateTable_(table, lang) {
    for (let rowIndex = 0; rowIndex < table.getNumRows(); rowIndex++) {
      const row = table.getRow(rowIndex);

      for (let cellIndex = 0; cellIndex < row.getNumCells(); cellIndex++) {
        const cell = row.getCell(cellIndex);

        for (
          let childIndex = 0;
          childIndex < cell.getNumChildren();
          childIndex++
        ) {
          const child = cell.getChild(childIndex);

          if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
            translateTextChildren_(child.asParagraph(), lang);
          } else if (child.getType() === DocumentApp.ElementType.LIST_ITEM) {
            translateTextChildren_(child.asListItem(), lang);
          }
        }
      }
    }
  }

  /**
   * Exports a Google Doc as a PDF to the source document's folder.
   */
  function exportPdf_(fileId, fileName) {
    const exportUrl =
      "https://docs.google.com/document/d/" + fileId + "/export?format=pdf";

    const response = UrlFetchApp.fetch(exportUrl, {
      headers: {
        Authorization: "Bearer " + ScriptApp.getOAuthToken()
      }
    });

    folder.createFile(response.getBlob().setName(fileName + ".pdf"));
  }

  const translatedDocumentIds = {};

  Object.keys(TRANSLATIONS).forEach(function (suffix) {
    const language = TRANSLATIONS[suffix];
    const translatedName = originalFile.getName() + "-" + suffix;
    const translatedCopy = originalFile.makeCopy(translatedName, folder);
    const translatedDocument = DocumentApp.openById(translatedCopy.getId());
    const body = translatedDocument.getBody();

    for (let index = 0; index < body.getNumChildren(); index++) {
      const element = body.getChild(index);

      if (element.getType() === DocumentApp.ElementType.PARAGRAPH) {
        translateTextChildren_(element.asParagraph(), language);
      } else if (element.getType() === DocumentApp.ElementType.LIST_ITEM) {
        translateTextChildren_(element.asListItem(), language);
      } else if (element.getType() === DocumentApp.ElementType.TABLE) {
        translateTable_(element.asTable(), language);
      }
    }

    let footer = translatedDocument.getFooter();

    if (!footer) {
      footer = translatedDocument.addFooter();
    } else {
      footer.clear();
    }

    footer.appendParagraph("");

    const disclaimer = footer.appendParagraph(FOOTER_TEXTS[suffix]);
    disclaimer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    disclaimer.setFontSize(10);

    footer.appendParagraph("");

    translatedDocument.saveAndClose();
    translatedDocumentIds[suffix] = translatedCopy.getId();
  });

  Object.keys(translatedDocumentIds).forEach(function (suffix) {
    exportPdf_(
      translatedDocumentIds[suffix],
      originalFile.getName() + "-" + suffix
    );
  });

  Logger.log("Chinese, Japanese, and Russian preliminary translations completed.");
}
