const fs = require('fs');
const path = require('path');

const log = './log5.txt';
const log2 = './log3';

const getLines = path => fs.readFileSync(path, 'utf8')
  .split('\n')
  .filter(l => l != '');

const models = {};

const equivsLines = getLines('equivs');
const equivs = {};

for (const l of equivsLines) {
  if(l.trimLeft().startsWith('//')) {
    continue;
  }
  const [from, to] = l.split('=').map(s => s.trim());
  equivs[from] = to;
}

// char
let currentLabel = null;

const followAlias = (name, max) => {
  let j = 0;
  let n = name;
  // TODO union find
  while (Object.hasOwn(equivs, n) &&
    equivs[n] !== n
  ) {
    // TODO assumes a DAG
    // just kill if we make a mistake
    if (j > max) {
      throw new Exception('Cyclic alias');
    }
    n = equivs[n];
  }

  return n;
}

// problem in log5?
for (const f of [log2]) {
  const lines = getLines(f);
  let i = 0;
  for (const l of lines) {
    const [start, end] = l.split(' - ');
    const [label, doorStr] = start.split('x');
    const door = Number(doorStr);

    const roomLabel = currentLabel ?? label;

    const roomName = followAlias(`${roomLabel}${i}`);

    if (!Object.hasOwn(models, roomName)) {
      models[roomName] = { rooms: new Array(6) };
    }

    let provisionalName = followAlias(
      models[roomName]?.rooms[door] ??  `${end}${i + 1}`
    );

    models[roomName].rooms[door] = provisionalName;

    currentLabel  = provisionalName[0];
    i++;
  }
}




for (const [label, { rooms }] of Object.entries(models)) {
  console.log(label, rooms);
}
console.log();

// QUERY
const SEARCH_LABEL = 'A';
const SEARCH_DOOR = 1;
const SEARCH_DEST = 'D';

for(const [k, v] of Object.entries(models)) {
  if (k[0] == SEARCH_LABEL &&
    v.rooms[SEARCH_DOOR] && v.rooms[SEARCH_DOOR][0] == SEARCH_DEST
  ) {
    console.log('match', k, v);
  }
}

for(const [k, v] of Object.entries(models)) {
  if (k[0] == SEARCH_LABEL &&
    v.rooms[SEARCH_DOOR] && v.rooms[SEARCH_DOOR][0] != SEARCH_DEST
  ) {
    console.log('NOT match', k, v);
  }
}


