import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildOpenApiDocument } from './openapi.js';

const outputPath = fileURLToPath(new URL('./openapi.json', import.meta.url));

writeFileSync(outputPath, `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
