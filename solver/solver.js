const fs = require('fs');
const process = require('node:process');

const method = process.argv[2];

const printHelp = () => {
  console.error("USAGE:");
  console.error("\tq/query A3 D -- get all As with door 3 pointing to a D (and those that don't)");
  console.error("\tm/merge A 35 25 21 -- get all learned equivalencies after merge.");
  console.error("\tp/print -- print current walk/state");
  console.error("\tg/guess -- print final JSON based on internal state. MUST be finished");
  console.error("\th/help -- print this message");
  process.exit(1);
}

if (undefined === method ||
  method === 'help' || 
  method === 'h'
) {
  printHelp();
}

const PRINT = {
  'rooms': 0,
  'query': 0,
  'walk': 0,
  'final': 0,
  'merge': 0
};

let SEARCH_LABEL = 'A';
let SEARCH_DOOR = 0;
let SEARCH_DEST = 'A';

let MERGE_LABEL = 'A';
let MERGE_NUMBERS = [0,0]


if (['q', 'query'].includes(method)) {
  const from = process.argv[3];
  const to = process.argv[4];

  if (!from || !to ||
    from.length < 2 ||
    !['a','b','c','d'].includes(from[0].toLowerCase()) ||
    Number.isNaN(from.substring(1)) ||
    Number(from.substring(1)) > 5 ||
    Number(from.substring(1)) < 0 ||
    !['a','b','c','d'].includes(to)
  ) {
    printHelp();
  }

  SEARCH_LABEL = from[0].toUpperCase();
  SEARCH_DOOR = Number(from.substring(1));
  SEARCH_DEST = to.toUpperCase();

  PRINT.query = true;
} else if (['m', 'merge'].includes(method)) {
  const letter = process.argv[3];
  const numbers = process.argv.slice(4);

  if (!['a', 'b', 'c', 'd'].includes(letter.toLowerCase()) ||
    numbers.some(n => Number.isNaN(n)) ||
    numbers.length < 2
  ) {
    printHelp();
  }

  MERGE_LABEL = letter.toUpperCase();
  MERGE_NUMBERS = numbers.map(n => Number(n));
  MERGE_NUMBERS.sort((a, b) => b - a);
  
  PRINT.merge = true;
} else if (['p', 'print'].includes(method)) {
  PRINT.rooms = true;
  PRINT.walk = true;
} else if (['g', 'guess'].includes(method)) {
  PRINT.final = true;
} else {
  printHelp();
}

// TODO should maybe read in logs automatically from an env?
// (ditto equivs)
const log = __dirname +'/../primus/log5.txt';
const log2 = __dirname + '/../primus/log3';
const equivFile = __dirname + '/../primus/equivs';

const getLines = path => fs.readFileSync(path, 'utf8')
  .split('\n')
  .filter(l => l != '');

const models = {};

const equivsLines = getLines(equivFile);
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

const walk = [];

let currentLabel = null;
let i = 0;
for (const f of [log, log2]) {
  const lines = getLines(f);
  for (const l of lines) {
    const [start, end] = l.split(' - ');
    const [label, doorStr] = start.split('x');
    const door = Number(doorStr);

    const roomLabel = currentLabel ?? label;

    // TODO should handle equiv if @ i % lines.length == 0?
    const roomName = followAlias(`${roomLabel}${i}`);

    if (!Object.hasOwn(models, roomName)) {
      models[roomName] = { rooms: new Array(6) };
    }

    walk.push({
      label: roomName,
      doorIndex: door,
      result: end
    });

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


if (PRINT.walk) {
  for (const w of walk) {
    console.log(w.label, 'x', w.doorIndex, '=>', w.result);
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

const labelToInt = l => ({
  'A': 0,
  'B': 1,
  'C': 2,
  'D': 3
})[l[0]];

// [from][to] = int list of door pos

// @return { startingRoom, rooms, connections }
const resolvePairs = (models) => {
  const ms = Object.entries(models)
    .map(([k, v]) => ({ ...v, label: k }));

  const modelIndices = {};
  for (let j = 0; j < ms.length; j++) {
    modelIndices[ms[j].label] = j;
  }

  const doorLookup = {};
  for (const m of ms) {
    for (let i = 0; i < m.rooms.length; i++) {
      const to = m.rooms[i];
      const from = m.label;

      if (!Object.hasOwn(doorLookup, from)) {
        doorLookup[from] = {};
      }
      if (!Object.hasOwn(doorLookup[from], to)) {
        doorLookup[from][to] = [];
      }

      doorLookup[from][to].push(i);
    }
  }

  const doors = [];
  for (let i = 0; i < ms.length; i++) {
    const m = ms[i];
    for (let j = 0; j < m.rooms.length; j++) {
      const to = m.rooms[j];
      const toIndex = modelIndices[to];
      // TODO temp for incomplete
      if (!Object.hasOwn(doorLookup, to)) {
        console.error('MISSING', i, j, to, toIndex);
        continue;
      }
      const doorIndex = doorLookup[to][m.label].shift();

      doors.push({
        from: {
          room: i,
          door: j
        },
        to: {
          room: toIndex,
          door: doorIndex
        }
      });
    }
  }

  return {
    startingRoom: modelIndices[ms[0].label],
    rooms: ms.map(({ label }) => labelToInt(label)),
    connections: doors
  };
}

const uniqStrings = (strings) => {
  const map = {};
  for (const s of strings) {
    map[s] = true;
  }
  return Object.keys(map);
}

const merge = (
  letter,
  numbers, // int[] desc
  models,
  walk
) => {
  const statements = [];
  const qEnd = numbers[numbers.length - 1];
  const q = numbers.slice(0, numbers.length - 1)
    .map(n => ({ from: `${letter}${n}`, to: `${letter}${qEnd}`}));

  let firstPass = true;
  while(q.length) {
    const { from, to } = q.shift();
    const [fromModel, toModel] = [from, to].map(l => models[l]);

    if (!fromModel || !toModel) {
      throw new Error(
        `Models missing in existing map: ${from} or ${to}`
      );
    }

    for (let i = 0; i < 6; i++) {
      const [x, y] = [fromModel, toModel]
        .map(m => m.rooms[i])
        .filter(l => l)
        .map(s => [s[0], Number(s.substring(1))]);

      if (!x || !y) {
        continue;
      }
      if (x[0] !== y[0]) {
        throw new Error(
          `Contradiction detected: ${fromModel.label}: ${fromModel.rooms[i]} ` +
            `of different label than ${toModel.label}: ${toModel.rooms[i]}`
        );
      }

      if (x[1] !== y[1] &&
        // protect against running off the end of the walk
        [x, y].every(([l, n]) => Object.hasOwn(models, `${l}${n}`))
      ) {
        const xIsGreater = x[1] > y[1];
        q.push({
          from: xIsGreater ? fromModel.rooms[i] : toModel.rooms[i],
          to: xIsGreater ? toModel.rooms[i] : fromModel.rooms[i]
        });
      }
    }

    if (firstPass) {
      const exits = {};
      for (let k = 0; k < walk.length - 1; k++) {
        const [curr, next] = [k, k + 1].map(n => walk[n]);

        const { label, doorIndex } = curr;
        const { label: result } = next;
        if (k % (getLines(log).length - 1) === 0) {
          continue;
        }
        
        const key = `${label}x${doorIndex}`;
        if (!Object.hasOwn(exits, key)) {
          exits[key] = [result];
        } else {
          exits[key].push(result);
        }
      }

      for (const dests of Object.values(exits)) {
        const uniqDests = uniqStrings(dests);
        if (uniqDests.length > 1) {
          uniqDests.sort(
            (a, b) => Number(b.substring(1)) - Number(a.substring(1))
          );

          const destEnd = uniqDests[uniqDests.length - 1];
          const rest = uniqDests.slice(0, uniqDests.length - 1)
            // protect against running off the end of the walk
            .filter(l => Object.hasOwn(models, l));

          rest.forEach(d => {
            q.push({
              from: d,
              to: destEnd
            });
          });
        }
      }

      firstPass = false;
    }


    statements.push(`${from}=${to}`);
  }

  return statements;
}

if (PRINT.merge) {
  const updates = uniqStrings(
    merge(MERGE_LABEL, MERGE_NUMBERS, models, walk)
  );

  console.log(updates.join('\n') + '\n');
}


if (PRINT.final) {
  console.log(JSON.stringify({
    id: "prendradjaja@gmail.com hkRpqR6OKKIWypTz2HSNQw",
    map: resolvePairs(models)
  }, null, 1));
}
