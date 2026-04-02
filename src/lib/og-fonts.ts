import { readFile } from 'node:fs/promises';
import path from 'node:path';

const DOTO_FONT_FILE = path.join(process.cwd(), 'Doto Font', 'static', 'Doto-Regular.ttf');

let dotoFontDataPromise: Promise<ArrayBuffer> | undefined;

export function getDotoFontData() {
  if (!dotoFontDataPromise) {
    dotoFontDataPromise = readFile(DOTO_FONT_FILE).then((file) =>
      file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
    );
  }

  return dotoFontDataPromise;
}
