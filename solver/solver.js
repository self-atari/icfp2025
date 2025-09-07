const fs = require('fs');

const SEARCH_LABEL = 'A';
const SEARCH_DOOR = 3;
const SEARCH_DEST = 'D';

const MERGE_LABEL = 'A';
const MERGE_NUMBERS = [35, 29];

// TODO should maybe read in logs automatically?

// q/query a3 d
// m/merge a 35 25 21
// p/print (rooms, walk)
// g/guess (final)

const PRINT = {
  'rooms': 1,
  'query': 1,
  'walk': 0,
  'final': 0,
  'merge': 1
};

const log = __dirname +'/../primus/log5.txt';
const log2 = __dirname + '/../primus/log3';

const getLines = path => fs.readFileSync(path, 'utf8')
  .split('\n')
  .filter(l => l != '');

const models = {};

const equivsLines = getLines(__dirname + '/../primus/equivs');
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
        [x, y].every(l => Object.hasOwn(models, l))
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

  console.log(updates.join('\n'));
}


if (PRINT.final) {
  console.log(JSON.stringify({
    id: "prendradjaja@gmail.com hkRpqR6OKKIWypTz2HSNQw",
    map: resolvePairs(models)
  }, null, 1));
}
