// Исходники GitHub Pages — docs/. Для Sites создаём чистую копию в dist/.
import { cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const source = fileURLToPath(new URL('../docs/', import.meta.url));
const output = fileURLToPath(new URL('../dist/', import.meta.url));
rmSync(output, { recursive: true, force: true });
cpSync(source, output, { recursive: true });
console.log('Static assets prepared in dist/');
