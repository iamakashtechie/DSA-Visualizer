import fs from 'fs';
import path from 'path';

// Just an empty overrides file for M0
fs.writeFileSync(
  path.join(process.cwd(), 'content', 'overrides.json'),
  JSON.stringify({}, null, 2)
);
