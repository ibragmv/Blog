import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const OG_FONT_FAMILY = 'Doto';

const OG_FONT_FILE = path.join(process.cwd(), 'fonts', 'doto', 'static', 'Doto-Regular.ttf');

let ogFontDataPromise: Promise<ArrayBuffer> | undefined;

export function getOgFontData() {
  if (!ogFontDataPromise) {
    ogFontDataPromise = readFile(OG_FONT_FILE).then((file) =>
      file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
    );
  }

  return ogFontDataPromise;
}
