/**
 * Creates Spanish and Brazilian Portuguese copies of the active Google Doc,
 * adds a localized disclaimer to each footer, and exports both copies as PDF.
 *
 * The translated Google Docs and PDFs are saved in the same Drive folder as
 * the original document. The source document is assumed to be in English.
 */
function translateAndExportDocEsPt() {
  const ORIGINAL_DOC_ID = DocumentApp.getActiveDocument().getId();

  const TRANSLATIONS = {
    es_ES: "es",
    pt_BR: "pt"
  };

  const FOOTER_TEXTS = {
    es_ES:
      "Esta transcripción es un documento preliminar generado por inteligencia artificial y puede contener imprecisiones. Este material es propiedad de Tergar International y está destinado exclusivamente para su uso dentro del Programa de Formación de Profesores de Meditación de Tergar. Queda estrictamente prohibida su copia, distribución o utilización no autorizada fuera del Programa de Formación de Profesores de Meditación de Tergar.",
    pt_BR:
      "Esta transcrição é um documento preliminar gerado por inteligência artificial e pode conter imprecisões. Este material é propriedade da Tergar International e destina-se exclusivamente ao uso no Programa de Formação de Professores de Meditação da Tergar. É estritamente proibida a cópia, distribuição ou utilização não autorizada fora do Programa de Formação de Professores de Meditação da Tergar."
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

  Logger.log("Spanish and Portuguese preliminary translations completed.");
}
