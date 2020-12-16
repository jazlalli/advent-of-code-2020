const fs = require("fs");
const path = require("path");
const assert = require("assert").strict;

function getBitsFromMask(line) {
  const mask = line.split("=")[1].trim();
  const bits = mask.split("");

  const onBits = [];
  const offBits = [];
  const floatingBits = [];

  for (let i = 0; i < bits.length; i++) {
    const bitIndex = bits.length - 1 - i;
    if (bits[i] === "X") floatingBits.push(bitIndex);
    if (bits[i] === "1") onBits.push(bitIndex);
    if (bits[i] === "0") offBits.push(bitIndex);
  }

  return [onBits, offBits, floatingBits];
}

function parseInstruction(line) {
  const [instruction, value] = line.split("=");
  const memoryAddress = instruction.trim().match(/\d+/)[0];

  return [memoryAddress, value.trim()];
}

// from https://lucasfcosta.com/2018/12/25/bitwise-operations.html but converted
// to use BigInt as we're dealing with more than 32-bits
const setBit = (num, bitIndex) => {
  const bitMask = BigInt(1) << BigInt(bitIndex);
  return BigInt(num) | BigInt(bitMask);
};
const clearBit = (num, bitIndex) => {
  const bitMask = ~(BigInt(1) << BigInt(bitIndex));
  return BigInt(num) & BigInt(bitMask);
};

// PART 1
(function () {
  console.group("part 1");

  const program = fs
    .readFileSync("program.txt")
    .toString()
    .split("\n")
    .filter((line) => line !== "\n");

  let bitsToSet = [];
  let bitsToClear = [];
  let MEMORY = {};

  program.forEach((line) => {
    if (/^mask/.test(line)) {
      [bitsToSet, bitsToClear] = getBitsFromMask(line);
    }

    if (/^mem/.test(line)) {
      let [memoryAddr, value] = parseInstruction(line);
      bitsToSet.forEach((bitIdx) => (value = setBit(value, bitIdx)));
      bitsToClear.forEach((bitIdx) => (value = clearBit(value, bitIdx)));
      MEMORY[memoryAddr] = value;
    }
  });

  const answer = Object.keys(MEMORY)
    .map((key) => MEMORY[key])
    .reduce((curr, next) => curr + next);

  console.log("answer ->", answer);

  // FOR USE WITH test1.txt
  // assert.equal(answer, 165);

  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");

  const program = fs
    .readFileSync("program.txt")
    .toString()
    .split("\n")
    .filter((line) => line !== "\n");

  let bitsToSet = [];
  let floatingBits = [];
  let MEMORY = {};

  program.forEach((line) => {
    if (/^mask/.test(line)) {
      // we don't care about bits to clear here
      [bitsToSet, _, floatingBits] = getBitsFromMask(line);
    }

    if (/^mem/.test(line)) {
      let [memoryAddr, value] = parseInstruction(line);

      // start decoding memory address by setting bits from mask
      bitsToSet.forEach((bitIdx) => (memoryAddr = setBit(memoryAddr, bitIdx)));

      // get floating bit permutations from mask
      const floatPermutations = Math.pow(2, floatingBits.length);
      const permutations = [];
      for (let i = 0; i < floatPermutations; i++) {
        permutations.push(i.toString(2).padStart(floatingBits.length, "0"));
      }

      // use each permutation to set/clear bits accordingly and
      // set the memory address for each
      permutations.forEach((permutation) => {
        const bits = permutation.split("");
        let permutationResult = memoryAddr;

        floatingBits.forEach((bitIdx, itemIdx) => {
          permutationResult =
            bits[itemIdx] === "1"
              ? setBit(permutationResult, bitIdx)
              : clearBit(permutationResult, bitIdx);
        });

        MEMORY[permutationResult] = BigInt(value);
      });
    }
  });

  const answer = Object.keys(MEMORY)
    .map((key) => MEMORY[key])
    .reduce((curr, next) => curr + next);

  console.log("answer ->", answer);

  // FOR USE WITH test2.txt
  // assert.equal(answer, 208n);

  console.groupEnd();
})();
