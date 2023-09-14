import * as fs from 'fs';
import path from 'path';

function rgbToAnsi(r: number, g: number, b: number) {
  if (r === g && g === b) {
    if (r < 8) {
      return 16;
    }
    if (r > 248) {
      return 231;
    }
    return Math.round(((r - 8) / 247) * 24) + 232;
  }
  return 16 + (36 * Math.round(r / 255 * 5)) + (6 * Math.round(g / 255 * 5)) + Math.round(b / 255 * 5);
}

function pixelToText(r: number, g: number, b: number) {
  const ansiColorCode = rgbToAnsi(r, g, b);
  return `\x1b[38;5;${ansiColorCode}m`;
}

function printColor(r: number, g: number, b: number) {
  process.stdout.write(pixelToText(r, g, b) + '▇');
}

// load json
const json = JSON.parse(fs.readFileSync(path.join(__dirname, './output_sanyue.json'), 'utf8')) as {
  width: number;
  height: number;
  pixels: number[][];
}

/**
 * we purposely use Chinese function name
 */
export function 三月七(...args: any[]) {
  // this is hard cutting, may cause inconsistency
  // set this to 2, 3 ... to make the image smaller( skip some pixels )
  const zoom_factor = 1

  for (let y = 0; y < json.height; y += zoom_factor) {
    for (let x = 0; x < json.width; x += zoom_factor) {
      for (let c = 0; c < 3; c++) {
        const color = json.pixels[y * json.width + x];
        printColor(color[0], color[1], color[2]);
      }
    }
    process.stdout.write('\n');
  }
}
