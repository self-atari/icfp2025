const fs = require('fs');
const process = require('node:process');
const crypto = require('crypto');

const printUsage = () => {
  console.error('USAGE:');
  console.error("\tpath_string_file response.json_file");
  process.exit(1);
}

const [pathsFile, responsesFile] = process.argv.slice(3);
if (!pathsFile || !responsesFile) {
  printUsage();
}

if (!fs.existsSync('.soenv')) {
  fs.appendFileSync('.equiv', '');
  fs.appendFileSync('.soenv', 'equiv=".equiv"');
}

const [pathsJson, responsesJson] = [pathsFile, responsesFile]
  .map(p => fs.readFileSync(p, 'utf8'))
  .map(s => JSON.parse(s));

const paths = pathsJson.plans.map(s => s.split('').map(Number));
const responses = responsesJson.results;

if (responses.length !== paths.length) {
  throw new Error(
    'Number of responses does not match number of paths'
  );
  process.exit(1);
}
for (let i = 0; i < paths.length; i++) {
  const [p, r] = [paths, responses].map(l => l[i]);
  if (p.length !== r.length + 1) {
    throw new Error(
      'Path does not match response length'
    );
    process.exit(1);
  }
}

const toLetter = x => 'ABCD'[x];

// int arr
const getString(path, resp) => {
  if (path.length !== resp.length + 1) {
    throw new Error(
      'Path does not match response length'
    );
    process.exit(1);
  }
  const strs = [];
  for (let i = 0; i < resp.length - 1; i++) {
    const next = resp[i + 1];
    strs.push(`${toLetter(resp[i])}x${path[i]} - ${toLetter(next)}`);
  }

  return strs.join('\n');
}

const files = [];

for (let j = 0; j < paths.length; j++) {
  const [p, r] = [paths, responses].map(l => l[i]);
  // TODO allow for override?
  const uuid = crypto.randomUUID();
  const fileName = `.solog-${uuid}`;
  files.push(fileName);
  fs.appendFileSync('.soenv', `logs[]="${fileName}"`);
  fs.appendFileSync(fileName, getString(p, r));
}

console.log(
  'Wrote to:',
  files
);
