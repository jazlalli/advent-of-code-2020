const fs = require("fs");
const path = require("path");

let INPUT = fs.readFileSync("instructions.txt").toString().split("\n");

function interpret(instruction) {
  const parts = instruction.split(" ");
  const command = parts[0];
  const value = Number(parts[1]);

  return { command, value };
}

function execute(instruction, instructionIndex, accumulator) {
  let { command, value } = interpret(instruction);

  const isLastInstruction = command === "";
  if (isLastInstruction) {
    command = "end";
  }

  switch (command) {
    case "acc":
      return [instructionIndex + 1, accumulator + value];
    case "jmp":
      return [instructionIndex + value, accumulator];
    case "nop":
      return [instructionIndex + 1, accumulator];
    case "end":
      return ["end", accumulator];
    default:
      throw new Error(`Unrecognised command: ${command}`);
  }
}

// PART 1
(function () {
  console.group("part 1");

  let instructions = INPUT;
  let instructionIndex = 0;
  let accumulator = 0;

  // keep track of instructions previously run
  const instructionCache = new Set();

  do {
    // add the instruction index to the cache
    instructionCache.add(instructionIndex);

    // run it
    [instructionIndex, accumulator] = execute(
      instructions[instructionIndex],
      instructionIndex,
      accumulator
    );
  } while (
    // if the new index is not in the cache, go again
    instructionCache.has(instructionIndex) === false
  );

  console.log(
    `Attempted to run a command twice, stopping! acc = ${accumulator}`
  );

  // FOR USE WITH testInput.txt
  // const assert = require("assert").strict;
  // assert.equal(accumulator, 5);

  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");

  let instructions = INPUT;
  let instructionIndex = 0;
  let accumulator = 0;

  // keep track of instructions previously run
  const instructionCache = new Set();

  // all available jmp instructions and their index, for flipping later
  const JMPS = INPUT.map((instruction, idx) => {
    if (instruction.indexOf("jmp") === 0) {
      return { index: idx, command: instruction };
    }
  }).filter(Boolean);

  // all available nop instructions and their index, for flipping later
  const NOPS = INPUT.map((instruction, idx) => {
    if (instruction.indexOf("nop") === 0) {
      return { index: idx, command: instruction };
    }
  }).filter(Boolean);

  // given an instruction and its index (instructionToFlip), find it in the
  // instructions list and flip it
  function modifyInstructions(instructions, instructionToFlip) {
    const { index, command } = instructionToFlip;

    function flip(command) {
      if (command.includes("jmp")) {
        return `nop ${command.split(" ")[1]}`;
      }
      if (command.includes("nop")) {
        return `jmp ${command.split(" ")[1]}`;
      }
    }

    const modifiedInstructions = instructions.map((instruction, idx) => {
      if (index === idx) {
        console.log(`(╯°□°)╯︵ ┻━┻ flipping ${command} to ${flip(command)}`);
        return instruction.replace(command, flip(command));
      }

      return instruction;
    });

    return modifiedInstructions;
  }

  do {
    // trap infinite loop condition and handle it
    if (instructionCache.has(instructionIndex) === true) {
      // pop the next available instruction we can flip
      const instructionToChange =
        JMPS.length > 0 ? JMPS.pop() : NOPS.length > 0 ? NOPS.pop() : null;

      // if we're all out of instructions to flip, nothing more we can do
      if (instructionToChange === null) {
        return -1;
      }

      // modify the instruction set with the desired change
      instructions = modifyInstructions(INPUT, instructionToChange);

      // reset state
      instructionCache.clear();
      instructionIndex = 0;
      accumulator = 0;

      // and carry on
      continue;
    }

    // add the instruction index to the cache
    instructionCache.add(instructionIndex);

    // run it
    [instructionIndex, accumulator] = execute(
      instructions[instructionIndex],
      instructionIndex,
      accumulator
    );
  } while (
    // keep going until we've reached the end of the instruction set
    instructionIndex !== "end"
  );

  console.log(`Reached end of instructions! acc = ${accumulator}`);

  // FOR USE WITH testInput.txt
  // const assert = require("assert").strict;
  // assert.equal(accumulator, 8);

  console.groupEnd();
})();
