const fs = require("fs");
const path = require("path");
const assert = require("assert").strict;

const cube = fs
  .readFileSync("testInput.txt")
  .toString()
  .split("\n")
  .map((line) => line.split(""));

function makeCube(xMax, yMax, zMax) {
  const gridDimension = xMax;
  const cubeHeight = zMax;

  const templateCube = [];

  // z-axis - the slices
  for (let z = 0; z < cubeHeight; z++) {
    templateCube.push([]);
  }

  // y-axis - the grids
  for (let z = 0; z < cubeHeight; z++) {
    for (let y = 0; y < gridDimension; y++) {
      templateCube[z].push([]);
    }
  }

  // x-axis - the rows
  for (let z = 0; z < cubeHeight; z++) {
    for (let y = 0; y < gridDimension; y++) {
      for (let x = 0; x < gridDimension; x++) {
        templateCube[z][y][x] = ".";
      }
    }
  }

  return templateCube;
}

function makeHyperCube(wMax, cube) {
  const templateHyperCube = [];
  for (let w = 0; w < wMax; w++) {
    templateHyperCube.push[JSON.parse(JSON.stringify(cube))];
  }
}

function evaluateCell(coord, value, cubeMap) {
  const [x, y, z] = coord.split(",").map(Number);

  const adjacentCells = [];

  // same z
  for (let j = y - 1; j <= y + 1; j++) {
    for (let k = x - 1; k <= x + 1; k++) {
      if (k === x && j === y) {
        continue;
      }

      adjacentCells.push([k, j, z]);
    }
  }

  // z above and below
  for (let j = y - 1; j <= y + 1; j++) {
    for (let k = x - 1; k <= x + 1; k++) {
      adjacentCells.push([k, j, z - 1]);
      adjacentCells.push([k, j, z + 1]);
    }
  }

  const result = adjacentCells
    .map((c) => c.join(","))
    .map((c) => cubeMap.get(c))
    .reduce(
      (acc, val) => {
        acc[val] += 1;
        return acc;
      },
      { ".": 0, "#": 0 }
    );

  // currently active, needs deactivating
  if (value === "#" && (result["#"] < 2 || result["#"] > 3)) {
    return ".";
  }

  // currently inactive, needs activating
  if (value === "." && result["#"] === 3) {
    return "#";
  }

  return value;
}

function evaluateHypercell(coord, value, cubeMap) {
  const [x, y, z, w] = coord.split(",").map(Number);

  const adjacentCells = [];

  return value;
}

// PART 1
(function () {
  console.group("part 1");

  const CYCLES = 6;
  const gridDimension = CYCLES * 2 + cube[0].length;
  const cubeHeight = CYCLES * 2 + 1;

  const templateCube = makeCube(gridDimension, gridDimension, cubeHeight);

  // set the initial values in center of cube
  for (let i = 0; i < cube.length; i++) {
    for (let j = 0; j < cube.length; j++) {
      templateCube[(cubeHeight - 1) / 2][i + CYCLES][j + CYCLES] = cube[i][j];
    }
  }

  // construct a key -> value store of all cells and their initial value
  const CUBE_MAP = new Map();
  for (let z = 0; z < templateCube.length; z++) {
    for (let y = 0; y < templateCube[z].length; y++) {
      for (let x = 0; x < templateCube[z][y].length; x++) {
        CUBE_MAP.set(`${x},${y},${z}`, templateCube[z][y][x]);
      }
    }
  }

  // per cycle, loop through, evaluate neighbours, update values
  for (let i = 0; i < CYCLES; i++) {
    const cellsToChange = [];

    for (let [coord, value] of CUBE_MAP.entries()) {
      const newValue = evaluateCell(coord, value, CUBE_MAP);
      if (value !== newValue) {
        cellsToChange.push([coord, newValue]);
      }
    }

    // update cells
    console.log(`Cycle ${i} -> ${cellsToChange.length} cells to update...`);
    cellsToChange.forEach(([coord, value]) => {
      CUBE_MAP.set(coord, value);
    });
  }

  // count active cells
  let countOfActive = 0;
  for (let value of CUBE_MAP.values()) {
    if (value === "#") {
      countOfActive += 1;
    }
  }

  console.log("\nDONE\n====");
  console.log("Number of active cells ->", countOfActive);
  assert.equal(countOfActive, 112);

  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");
  const CYCLES = 6;
  const gridDimension = CYCLES * 2 + cube[0].length;
  const cubeHeight = CYCLES * 2 + 1;

  const templateCube = makeCube(gridDimension, gridDimension, cubeHeight);
  const hypercube = makeHyperCube(templateCube);

  // construct a key -> value store of all cells and their initial value
  const CUBE_MAP = new Map();
  for (let w = 0; w < hypercube.length; w++) {
    for (let z = 0; z < templateCube[w].length; z++) {
      for (let y = 0; y < templateCube[w][z].length; y++) {
        for (let x = 0; x < templateCube[w][z][y].length; x++) {
          CUBE_MAP.set(`${x},${y},${z},${w}`, templateCube[w][z][y][x]);
        }
      }
    }
  }

  // per cycle, loop through, evaluate neighbours, update values
  //   for (let i = 0; i < CYCLES; i++) {
  //     const cellsToChange = [];
  //
  //     for (let [coord, value] of CUBE_MAP.entries()) {
  //       const newValue = evaluateHypercell(coord, value, CUBE_MAP);
  //       if (value !== newValue) {
  //         cellsToChange.push([coord, newValue]);
  //       }
  //     }
  //
  //     // update cells
  //     console.log(`Cycle ${i} -> ${cellsToChange.length} cells to update...`);
  //     cellsToChange.forEach(([coord, value]) => {
  //       CUBE_MAP.set(coord, value);
  //     });
  //   }

  console.groupEnd();
})();
