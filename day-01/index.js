const fs = require("fs");
const path = require("path");

const input = fs.readFileSync("expenses.txt").toString();
const entries = input.split("\n").filter((line) => line !== "\n");
const values = entries.map(Number);
const target = 2020;

// PART 1
(function () {
  console.group("part 1");
  const diffs = values.map((v) => target - v);
  const result = values.filter((v) => diffs.includes(v));

  if (result.length === 2) {
    const answer = result[0] * result[1];
    console.log(`found ${result}`);
    console.log(`answer = ${answer}`);
    console.groupEnd();
  }
})();

// PART 2
(function () {
  console.group("part 2");
  const diff1 = values.flatMap((v1) =>
    values.map((v2) => target - v1 - v2).filter((val) => values.includes(val))
  );

  const result = Array.from(new Set(diff1));

  if (result.length === 3) {
    const answer = result[0] * result[1] * result[2];
    console.log(`found ${result}`);
    console.log(`answer = ${answer}`);
    console.groupEnd();
  }
})();
