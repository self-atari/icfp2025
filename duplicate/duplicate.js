// methods:
//  create (persist and return id)
//    -n N
//    [-o] file
//  explore
//    --id 
//      (stdin is file of plan json?)
//      string[]
//  guess

const create = (count) => {
  const rooms = [];
  for (let i = 0; i < count; i++) {
    const room = {
      id: i,
      doors: new Array(6)
    }

    rooms.push(room);
  }

  // pool of abs indices (room * 6 + i)
  const doorIndexPool = [];
  const visited = {};

  for (let j = 0; j < 6 * count; j++) {
    doorIndexPool.push(j);
  }

  for (let j = 0; j < 6 * count && doorIndexPool.length; j++) {
    if (visited[j]) continue;

    const roomIndex = Math.floor(j / 6);
    const doorIndex = j - (roomIndex * 6);

    // randomly select from the remaining flat door indices
    const randomIndex = Math.floor(
      Math.random() * doorIndexPool.length
    );


    const poolRawIndex = doorIndexPool[randomIndex];

    const poolRoomIndex = Math.floor(poolRawIndex / 6);
    const poolDoorIndex = poolRawIndex - (poolRoomIndex * 6);

    rooms[roomIndex].doors[doorIndex] = rooms[poolRoomIndex];
    rooms[poolRoomIndex].doors[poolDoorIndex] = rooms[roomIndex];

    // now I've gone and written O(n^2). clearly the wrong data struct
    doorIndexPool.splice(randomIndex, 1);
    const mainIndex = doorIndexPool.indexOf(j);
    if (-1 !== mainIndex) {
      doorIndexPool.splice(mainIndex, 1);
    }
    visited[poolRawIndex] = true;
    visited[j] = true;
  }

  const printRooms = (rooms) => {
    console.log(rooms.map(r => ({
      ...r,
      doors: r.doors.map(r => r.id)
    })));
  }

  const labelOverflow = count % 4;
  const perLabelCount = Math.floor(count / 4);

  const possLabels = [0,1,2,3];

  const toShuffled = arr => 
    arr.map(n => ({s: Math.random(), n}))
      .sort(({ s: s1 }, { s: s2 }) => s1 - s2)
      .map(({ n }) => n)

  const extraLabels = toShuffled(possLabels)
      .slice(0, labelOverflow);

  const labels = toShuffled([
    ...possLabels.flatMap(
      l => (new Array(perLabelCount).fill(l))
    ),
    ...extraLabels
  ]);

  const finalRooms = rooms.map(({ doors }, i) => ({
    // indices of relevant room in final array
    doors: doors.map(r => r.id),
    // label to be read on traversal
    label: labels[i]
  }));

  if (finalRooms.some(({ doors }, i) => doors.every(d => d === i))) {
    console.error("Invalid graph: a room is disconnected");
    exit(1);
  }

  // get argv for inputs

  return {
    starting: Math.floor(Math.random() * count),
    rooms: finalRooms
  }
}


// map { starting: int, rooms: { doors: int[6], label: 0-3 }[] }
// plans (int) string[]
const explore = (map, plans) => {
  // validate
  if (plans.some(p => p.length > 18 * map.rooms.length)) {
    console.error(
      "Invalid plan; exceeds maximum length of",
      18 * map.rooms.length
    );
    exit(1);;
  }

  const intPlans = [];
  for(const p of plans) {
    const intPlan = [];
    const ints = p.split('');
    for (const i of ints) {
      if (Number.isNaN(i)) {
        console.error(
          "Invalid plan; inlcuded a non-numeric character:",
          i
        );
        exit(1);;
      }
      const n = Number(i);
      if (n > 5) {
        console.error(
          "Invalid plan; inlcuded a door number greater than 5:",
          i
        );
        exit(1);;
      }
      intPlan.push(n);
    }
    intPlans.push(intPlan);
  }

  const exploreResults = [];
  for(const p of intPlans) {
    const result = [];
    let currentRoom = map.rooms[map.starting];
    for (const i of p) {
      result.push(currentRoom.label);
      currentRoom = map.rooms[currentRoom.doors[i]];
    }
    exploreResults.push(result);
  }

  return exploreResults;
}

const map = create(3);

const plan = "000111222333444555012345123450234501345012450123501234";

const result = explore(
  map,
  [plan]
);

console.log(JSON.stringify(result, null, 2));
