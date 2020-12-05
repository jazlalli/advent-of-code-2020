const fs = require("fs");
const path = require("path");

const input = fs.readFileSync("boardingpasses.txt").toString();
const passes = input.split("\n").filter((line) => line !== "\n");

function createList(size) {
  const list = [];
  for (var i = 0; i < size; i++) {
    list.push(i);
  }
  return list;
}

function chop(list, partition) {
  const midPoint = Math.ceil(list.length / 2);

  const chopped = [
    list.filter((_, idx) => idx < midPoint),
    list.filter((_, idx) => idx >= midPoint),
  ];

  return chopped[partition];
}

const ROWS = createList(128);
const COLUMNS = createList(8);

function findSeatLocationFromPass(pass) {
  const rowCode = pass.substring(0, 7);
  const columnCode = pass.substring(7);

  const partitionLookup = {
    F: 0,
    L: 0,
    B: 1,
    R: 1,
  };

  const row = rowCode
    .split("")
    // iterative binary search happening here
    .reduce((result, char) => chop(result, partitionLookup[char]), ROWS);

  const column = columnCode
    .split("")
    // iterative binary search happening here
    .reduce((result, char) => chop(result, partitionLookup[char]), COLUMNS);

  if (row.length !== 1) {
    throw new Error(
      `Wasn't able to narrow down to a row. Found ${
        row.length
      } rows, ${row.join(", ")}, respectively`
    );
  }

  if (column.length !== 1) {
    throw new Error(
      `Wasn't able to narrow down to a column. Found ${
        column.length
      } rows, ${column.join(", ")}, respectively`
    );
  }

  return { row: row[0], column: column[0] };
}

function seatLocationToId({ row, column }) {
  return row * 8 + column;
}

// PART 1
(function () {
  console.group("part 1");
  const seatLocations = passes.map(findSeatLocationFromPass);
  const seatIds = seatLocations.map(seatLocationToId);
  const maxSeatId = Math.max(...seatIds);

  console.log(`Max seat ID = ${maxSeatId}`);
  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");
  const seatLocations = passes.map(findSeatLocationFromPass);

  const seatMap = {};
  const rowNumbers = seatLocations.map((loc) => {
    const { row, column } = loc;

    // group seats by row
    if (seatMap[row] === undefined) {
      seatMap[row] = [column];
    } else {
      seatMap[row].push(column);
    }

    return row;
  });

  // get min and max row number so we can ignore it later
  rowNumbers.sort((a, b) => a - b);
  const minRow = rowNumbers[0];
  const maxRow = rowNumbers[rowNumbers.length - 1];

  let emptySeatRow = null;
  for (let [row, seats] of Object.entries(seatMap)) {
    // row comes out as a string so allow coercion in non-equality check
    if (row != minRow && row != maxRow && seats.length !== 8) {
      emptySeatRow = row;
      break;
    }
  }

  // find the missing column number
  const rowSeats = new Set(seatMap[emptySeatRow]);
  const [emptySeatColumn] = [0, 1, 2, 3, 4, 5, 6, 7].filter(
    (col) => rowSeats.has(col) === false
  );

  console.log(
    `There is an empty seat in row ${emptySeatRow}, column ${emptySeatColumn}`
  );

  const emptySeatId = seatLocationToId({
    row: emptySeatRow,
    column: emptySeatColumn,
  });

  console.log(`Empty seat ID = ${emptySeatId}`);
  console.groupEnd();
})();

// FOR USE WITH TEST DATA
// const assert = require("assert").strict;
// assert.deepEqual(seatLocations, [
//   { row: 44, column: 5 },
//   { row: 70, column: 7 },
//   { row: 14, column: 7 },
//   { row: 102, column: 4 },
// ]);
//
// assert.deepEqual(seatIds, [357, 567, 119, 820]);
