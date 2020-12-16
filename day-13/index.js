const fs = require("fs");
const path = require("path");
const assert = require("assert").strict;

const input = fs.readFileSync("buses.txt").toString();
const data = input.split("\n").filter((line) => line !== "\n");

// PART 1
(function () {
  console.group("part 1");

  const ARRIVAL = Number(data[0]);
  const BUSES = data[1]
    .split(",")
    .filter((timestamp) => timestamp !== "x")
    .map(Number);

  const busDiffs = BUSES.map((id) => {
    const earliestTimestampAfterArrival = id * Math.floor(ARRIVAL / id) + id;
    const diff = earliestTimestampAfterArrival - ARRIVAL;
    return { id: id, diff: diff };
  }).sort((a, b) => a.diff - b.diff);

  const earliestBus = busDiffs[0];

  console.log(
    `take bus ${earliestBus.id}, which will depart ${earliestBus.diff} minutes after arrival`
  );

  const answer = earliestBus.id * earliestBus.diff;
  console.log("answer ->", answer);

  // FOR USE WITH testInput.txt
  // assert.equal(answer, 295);

  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");
  const buses = data[1].split(",").map(Number);

  let commonDivisor = buses[0];
  let remainder = 0;

  for (let i = 1; i < buses.length; i++) {
    if (isNaN(buses[i])) continue;

    [commonDivisor, remainder] = chineseRemainderTheorem(
      commonDivisor,
      remainder,
      buses[i],
      i + 1
    );
  }

  const result = commonDivisor - remainder;

  console.log("answer ->", result);
  console.log(
    "answer for real input should be ->",
    807435693182510,
    "¯\\_(ツ)_/¯"
  );

  // FOR USE WITH testInput.txt
  // assert.equal(result, 1068781);

  function extendedEuclid(a, b) {
    // FROM: https://github.com/TheAlgorithms/Python/blob/master/blockchain/chinese_remainder_theorem.py
    if (b === 0) return [1, 0];
    let [x, y] = extendedEuclid(b, a % b);
    return [y, x - Math.floor(a / b) * y];
  }

  function chineseRemainderTheorem(num1, rem1, num2, rem2) {
    // FROM: https://github.com/TheAlgorithms/Python/blob/master/blockchain/chinese_remainder_theorem.py
    let [x, y] = extendedEuclid(num1, num2);
    m = num1 * num2;
    n = rem2 * x * num1 + rem1 * y * num2;
    return [m, ((n % m) + m) % m];
  }

  console.groupEnd();
})();
