const SEARCH_LABEL = 'B';
const SEARCH_DOOR = 5;
const SEARCH_DEST = 'C';

const PRINT = {
  'rooms': true,
  'query': false,
  'walk': false
};




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
  const matches = l.split('=').map(s => s.trim());
  for (const m of matches) {
    equivs[m] = matches[matches.length - 1];
  }
}

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

let currentLabel = null;
let i = 0;
for (const f of [log, log2]) {
  const lines = getLines(f);
  for (const l of lines) {
    const [start, end] = l.split(' - ');
    const [label, doorStr] = start.split('x');
    const door = Number(doorStr);

    const roomLabel = currentLabel ?? label;

    const roomName = followAlias(`${roomLabel}${i}`);

    if (!Object.hasOwn(models, roomName)) {
      models[roomName] = { rooms: new Array(6) };
    }

    if (PRINT.walk) {
      console.log(roomName, 'x', door, '-', end)
    }

    let provisionalName = followAlias(
      models[roomName]?.rooms[door] ?? `${end}${i + 1}`
    );

    const currentExitName = models[roomName].rooms[door];
    if (undefined === currentExitName) {
      models[roomName].rooms[door] = provisionalName;
    } else {
      equivs[provisionalName] = currentExitName;
    }

    i++;
    if (i % lines.length !== 0) {
      currentLabel  = provisionalName[0];
    } else {
      currentLabel = null;
    }
  }
}




if (PRINT.rooms) {
  for (const [label, { rooms }] of Object.entries(models)) {
    console.log(label, rooms);
  }
  console.log();
}

if (PRINT.query) {
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
}


