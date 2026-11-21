import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import PDFDocument from 'pdfkit';
import { renderPage } from './pdf-renderer.js';

/**
 * Creates a PDF from pages already available in the authenticated Sanoma
 * reader session. The page SVGs are rendered as supplied; this intentionally
 * does not decode the reader's separate .data payload or reconstruct a text
 * layer. As a result, the PDF preserves the appearance but its text may not
 * be selectable/searchable.
 */
export async function createPdf(outputPath, pages, headers = {}) {
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('Sanoma: nessuna pagina da inserire nel PDF.');
  }

  await fs.promises.mkdir(path.dirname(path.resolve(outputPath)), {
    recursive: true
  });

  const doc = new PDFDocument({
    autoFirstPage: false,
    margin: 0,
    compress: true
  });
  const output = fs.createWriteStream(outputPath);
  const writeDone = pipeline(doc, output);
  const fonts = Object.create(null);

  try {
    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      if (!page || !Number.isFinite(Number(page.pageNumber)) || !page.baseUrl) {
        throw new Error(`Sanoma: dati non validi per la pagina ${index + 1}.`);
      }

      await renderPage(
        doc,
        { ...page, spans: [] },
        index + 1,
        pages.length,
        headers,
        fonts
      );
    }

    doc.end();
    await writeDone;
  } catch (error) {
    doc.destroy(error);
    await writeDone.catch(() => {});
    throw error;
  }

  const stats = await fs.promises.stat(outputPath);
  if (stats.size === 0) {
    throw new Error('Sanoma: il PDF generato è vuoto.');
  }

  return outputPath;
}
