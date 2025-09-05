const input = `0 0 - 1 1
0 1 - 2 0
0 2 - 0 2
0 3 - 1 3
0 4 - 2 5
0 5 - 1 2
1 0 - 2 1
1 4 - 2 3
1 5 - 2 2
2 4 - 2 4`;

const lines = input.split('\n');
for (const line of lines) {
  const [start, end] = line.split(' - ');
  const [x1, y1] = start.split(' ').map(Number);
  const [x2, y2] = end.split(' ').map(Number);
  const entry = {
    from: { room: x1, door: y1 },
    to: { room: x2, door: y2 },
  }
  console.log(JSON.stringify(entry) + ',');
}