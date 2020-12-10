const fs = require("fs");
const path = require("path");

const input = fs.readFileSync("joltage.txt").toString();
const joltages = input
  .split("\n")
  .filter((line) => line !== "\n")
  .map(Number)
  .sort((a, b) => a - b);

function addStartAndEnd(joltages) {
  const MAX_JOLTAGE = joltages[joltages.length - 1] + 3;
  return [0, ...joltages, MAX_JOLTAGE];
}

function findDiffDistribution(joltages) {
  const JOLTAGES = addStartAndEnd(joltages);

  // diffs can only be 1, 2, or 3
  const distribution = { 1: [], 2: [], 3: [] };

  // index the current and next item
  for (let i = 0, next = i + 1; next < JOLTAGES.length; i++, next++) {
    const diff = JOLTAGES[next] - JOLTAGES[i];
    distribution[diff].push(JOLTAGES[next]);
  }

  return distribution;
}

function findChainPermutations(joltages) {
  const JOLTAGES = addStartAndEnd(joltages);

  let permutableChain = [];
  let totalPermutations = 1;

  // index the current and next item
  for (let i = 0, next = i + 1; next < JOLTAGES.length; i++, next++) {
    const diff = JOLTAGES[next] - JOLTAGES[i];

    if (diff < 3) {
      permutableChain.push(JOLTAGES[next]);
    } else {
      const chainLength = permutableChain.length;

      /*
        formula for calculating number of permutations of items in a list
        x(n) = n * (n-1) / 2 + 1

        ===
        no. of items -> permutations
        ===
        0 -> 1
        1 -> 1
        2 -> 2
        3 -> 4
        4 -> 7
        5 -> 11
        6 -> 16
      */
      const permutations = (chainLength * (chainLength - 1)) / 2 + 1;
      totalPermutations = totalPermutations * permutations;
      permutableChain = [];
    }
  }

  return totalPermutations;
}

// PART 1
(function () {
  console.group("part 1");

  const result = findDiffDistribution(joltages);
  const diffsOf1 = result[1].length;
  const diffsOf3 = result[3].length;
  const finalResult = diffsOf1 * diffsOf3;
  console.log("Final result ->", diffsOf1, "*", diffsOf3, "=", finalResult);

  // FOR USE WITH testInput.txt
  // const assert = require("assert").strict;
  // assert.equal(finalResult, 220);

  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");

  const permutations = findChainPermutations(joltages);
  console.log("Total no. of permutations ->", permutations);

  // FOR USE WITH testInput.txt
  // const assert = require("assert").strict;
  // assert.equal(permutations, 19208);

  console.groupEnd();
})();
