const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const assert = require("assert").strict;

const input = fs.readFileSync("seatLayout.txt").toString();
const seats = input
  .split("\n")
  .filter((line) => line !== "\n")
  .map((line) => line.split(""));

const STRATEGY = {
  ADJACENT: "ADJACENT",
  VISIBLE: "VISIBLE",
};

const DIRECTIONS = {
  FRONT_LEFT: "FRONT_LEFT",
  FRONT: "FRONT",
  FRONT_RIGHT: "FRONT_RIGHT",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  BACK_LEFT: "BACK_LEFT",
  BACK: "BACK",
  BACK_RIGHT: "BACK_RIGHT",
};

const NO_SEAT = ".";
const OCCUPIED_SEAT = "#";
const EMPTY_SEAT = "L";

const searchParams = {
  [DIRECTIONS.FRONT_LEFT]: {
    moreSeatsVisible: (i, j, iLimit, jLimit) => i >= 0 && j >= 0,
    goToNextSeat: (i, j) => [i - 1, j - 1],
  },
  [DIRECTIONS.FRONT]: {
    moreSeatsVisible: (i, j, iLimit, jLimit) => i >= 0,
    goToNextSeat: (i, j) => [i - 1, j],
  },
  [DIRECTIONS.FRONT_RIGHT]: {
    moreSeatsVisible: (i, j, iLimit, jLimit) => i >= 0 && j < jLimit,
    goToNextSeat: (i, j) => [i - 1, j + 1],
  },
  [DIRECTIONS.LEFT]: {
    moreSeatsVisible: (i, j, iLimit, jLimit) => j >= 0,
    goToNextSeat: (i, j) => [i, j - 1],
  },
  [DIRECTIONS.RIGHT]: {
    moreSeatsVisible: (i, j, iLimit, jLimit) => j < jLimit,
    goToNextSeat: (i, j) => [i, j + 1],
  },
  [DIRECTIONS.BACK_LEFT]: {
    moreSeatsVisible: (i, j, iLimit, jLimit) => i < iLimit && j >= 0,
    goToNextSeat: (i, j) => [i + 1, j - 1],
  },
  [DIRECTIONS.BACK]: {
    moreSeatsVisible: (i, j, iLimit, jLimit) => i < iLimit,
    goToNextSeat: (i, j) => [i + 1, j],
  },
  [DIRECTIONS.BACK_RIGHT]: {
    moreSeatsVisible: (i, j, iLimit, jLimit) => i < iLimit && j < jLimit,
    goToNextSeat: (i, j) => [i + 1, j + 1],
  },
};

function _deepCopy(source) {
  return JSON.parse(JSON.stringify(source));
}

function _createSeatMapHash(seats) {
  return crypto.createHash("md5").update(JSON.stringify(seats)).digest("hex");
}

function maybeUseSeat(i, j, seats) {
  return seats[i] !== undefined && seats[i][j] !== NO_SEAT
    ? seats[i][j]
    : NO_SEAT;
}

// for a given seat in a seatMap, "look" in a given direction, using desired
// strategy for assessing seats, and capture whatever you find.
function _findSeatsInAllDirections(
  seatCoordinates,
  seats,
  seatCaptureStrategy
) {
  let i, j;
  const foundSeats = [];

  for (let direction in DIRECTIONS) {
    const { goToNextSeat, moreSeatsVisible } = searchParams[direction];
    [i, j] = goToNextSeat(...seatCoordinates);

    if (seatCaptureStrategy === STRATEGY.ADJACENT) {
      foundSeats.push(maybeUseSeat(i, j, seats));
    }

    if (seatCaptureStrategy === STRATEGY.VISIBLE) {
      while (moreSeatsVisible(i, j, seats.length, seats[0].length)) {
        const seat = maybeUseSeat(i, j, seats);
        if (seat !== NO_SEAT) {
          foundSeats.push(seat);
          break;
        }

        [i, j] = goToNextSeat(i, j);
      }
    }
  }

  return foundSeats;
}

function _aggregateSurroundingSeats(surroundingSeatMap) {
  const aggregatedSeatMap = new Map();
  for (let [coords, surroundingSeats] of surroundingSeatMap) {
    const aggregatedSeatStates = surroundingSeats
      .filter(Boolean)
      .reduce(
        (state, item) => Object.assign(state, { [item]: state[item] + 1 }),
        { [OCCUPIED_SEAT]: 0, [NO_SEAT]: 0, [EMPTY_SEAT]: 0 }
      );

    aggregatedSeatMap.set(coords, aggregatedSeatStates);
  }

  return aggregatedSeatMap;
}

// build a map of seat coords -> list of surrounding seats to consider,
// according on the desired strategy
function _captureSurroundingSeats(
  seats,
  seatCaptureStrategy = STRATEGY.ADJACENT
) {
  const adjacentSeatMap = new Map();

  // build a map of seats and their surrounding seats, keyed by seat coords
  for (let i = 0, rowCount = seats.length; i < rowCount; i++) {
    for (let j = 0, rowLength = seats[i].length; j < rowLength; j++) {
      const surroundingSeats = _findSeatsInAllDirections(
        [i, j],
        seats,
        seatCaptureStrategy
      );

      adjacentSeatMap.set([i, j], surroundingSeats);
    }
  }

  // generate a new map of surrounding seats aggregated by their state (., #, or L)
  const aggregatedSeatStates = _aggregateSurroundingSeats(adjacentSeatMap);
  return aggregatedSeatStates;
}

// given a seatMap, and a map the surrounding seats for each seat, generate a new map
function _generateNewSeatMap(
  seats,
  aggregatedSurroundingSeats,
  maxOccupancyTolerance = 3
) {
  const newSeatMap = _deepCopy(seats);

  for (let [coords, surroundingSeats] of aggregatedSurroundingSeats) {
    const [i, j] = coords;

    if (newSeatMap[i][j] === EMPTY_SEAT) {
      if (surroundingSeats[OCCUPIED_SEAT] === 0) {
        newSeatMap[i][j] = OCCUPIED_SEAT;
      }
    } else if (newSeatMap[i][j] === OCCUPIED_SEAT) {
      if (surroundingSeats[OCCUPIED_SEAT] > maxOccupancyTolerance) {
        newSeatMap[i][j] = EMPTY_SEAT;
      }
    }
  }

  return newSeatMap;
}

function findStableSeatMap(
  seats,
  surroundingSeatStrategy,
  maxOccupancyTolerance
) {
  let currentSeatMap = _deepCopy(seats);
  // use md5 hash of the seat map to find when it stabilses
  let seatMapHash = _createSeatMapHash(currentSeatMap);

  // this will hold our final result
  let newSeatMap = null;

  while (true) {
    const surroundingSeats = _captureSurroundingSeats(
      currentSeatMap,
      surroundingSeatStrategy
    );

    newSeatMap = _generateNewSeatMap(
      currentSeatMap,
      surroundingSeats,
      maxOccupancyTolerance
    );

    const newSeatMapHash = _createSeatMapHash(newSeatMap);

    // have we generated this map before?
    if (seatMapHash === newSeatMapHash) break;
    else {
      // reset state and continue
      currentSeatMap = newSeatMap;
      seatMapHash = newSeatMapHash;
    }
  }

  return newSeatMap;
}

function countOccupiedSeats(seatMap) {
  return seatMap
    .flatMap((row) => row.map((seat) => seat))
    .filter((seat) => seat === OCCUPIED_SEAT);
}

// PART 1
(function () {
  console.group("part 1");

  const newSeatMap = findStableSeatMap(seats);
  const noOfOccupiedSeats = countOccupiedSeats(newSeatMap).length;

  console.log(
    `Number of occupied seats using ADJACENT strategy ->`,
    noOfOccupiedSeats
  );

  // FOR USE WITH testInput.txt
  // assert.equal(noOfOccupiedSeats, 37);

  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");

  const MAX_OCCUPANCY = 4;
  const newSeatMap = findStableSeatMap(seats, STRATEGY.VISIBLE, MAX_OCCUPANCY);
  const noOfOccupiedSeats = countOccupiedSeats(newSeatMap).length;

  console.log(
    `Number of occupied seats using VISIBLE strategy ->`,
    noOfOccupiedSeats
  );

  // FOR USE WITH testInput.txt
  // assert.equal(noOfOccupiedSeats, 26);

  console.groupEnd();
})();
