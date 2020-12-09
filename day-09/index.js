const fs = require("fs");
const path = require("path");

const input = fs.readFileSync("xmas.txt").toString();
const NUMBERS = input
  .split("\n")
  .filter((line) => line !== "\n")
  .map(Number);

const PREAMBLE = 25;

function getAvailableSet(numbers, preambleSize, offset = 0) {
  const preamble = numbers.slice(0 + offset, preambleSize + offset);
  return preamble;
}

function findInvalidNumber(numbers, preambleSize) {
  // start iterating at the end of the  preamble
  for (let i = preambleSize; i < numbers.length; i++) {
    // get the last PREAMBLE items
    const availableSet = getAvailableSet(
      numbers,
      preambleSize,
      i - preambleSize
    );

    const target = numbers[i];

    // find 2 numbers in the set that add up to the next
    const diffs = new Set(availableSet.map((num) => target - num));
    const matches = availableSet.filter((num) => diffs.has(num));

    // no numbers add up to the target
    if (matches.length < 2) {
      console.log("Found the invalid number ->", target);
      return target;
    }
  }

  return null;
}

function findContigiousSet(numbers, targetSum) {
  let contigiousNumbers = [];
  let sumOfContigiousNumbers = 0;
  let iterator = 0;

  do {
    // success condition, we've found the set!
    if (sumOfContigiousNumbers === targetSum && contigiousNumbers.length > 1) {
      return { success: true, result: contigiousNumbers };
    }

    contigiousNumbers = [numbers[iterator], ...contigiousNumbers];
    sumOfContigiousNumbers += numbers[iterator];
    iterator += 1;
  } while (sumOfContigiousNumbers <= targetSum);

  return { success: false, result: null };
}

// PART 1
(function () {
  console.group("part 1");

  const invalidNumber = findInvalidNumber(NUMBERS, PREAMBLE);

  // FOR USE WITH testInput.txt
  // const assert = require("assert").strict;
  // assert.equal(invalidNumber, 127);

  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");

  const invalidNumber = findInvalidNumber(NUMBERS, PREAMBLE);

  let contigiousNumbers = [];

  for (let i = 0; i < NUMBERS.length; i++) {
    // we can discard items that precede the current iteration index
    const subset = NUMBERS.slice(i);

    const { success, result } = findContigiousSet(subset, invalidNumber);

    if (success === true) {
      contigiousNumbers = result;
      console.log("Found the contigious set ->", contigiousNumbers);
      break;
    }
  }

  const smallest = Math.min(...contigiousNumbers);
  const largest = Math.max(...contigiousNumbers);
  const sumOfSmallestAndLargest = smallest + largest;

  console.log(
    `Sum of smallest and largest -> ${smallest} + ${largest} =`,
    sumOfSmallestAndLargest
  );

  // FOR USE WITH testInput.txt
  // const assert = require("assert").strict;
  // assert.equal(sumOfSmallestAndLargest, 62);

  console.groupEnd();
})();
