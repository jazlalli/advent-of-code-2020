const fs = require("fs");
const path = require("path");
const assert = require("assert").strict;

const input = fs.readFileSync("navigation.txt").toString();
const instructions = input.split("\n").filter((line) => line !== "\n");

function _rotateBearing(bearing, direction, degrees) {
  let currentBearing = bearing;
  let newBearing = "";
  let turns = degrees / 90;

  while (turns > 0) {
    if (direction === 1) {
      if (currentBearing === "N") newBearing = "E";
      else if (currentBearing === "E") newBearing = "S";
      else if (currentBearing === "S") newBearing = "W";
      else if (currentBearing === "W") newBearing = "N";
    }

    if (direction === -1) {
      if (currentBearing === "N") newBearing = "W";
      else if (currentBearing === "E") newBearing = "N";
      else if (currentBearing === "S") newBearing = "E";
      else if (currentBearing === "W") newBearing = "S";
    }

    currentBearing = newBearing;
    turns--;
  }

  return newBearing;
}

function _rotateAround(position, direction, degrees) {
  let currentPosition = Object.assign({}, position);
  let newPosition = { N: 0, E: 0, S: 0, W: 0 };
  let turns = degrees / 90;

  while (turns > 0) {
    if (direction === 1) {
      newPosition.N = currentPosition.W;
      newPosition.E = currentPosition.N;
      newPosition.S = currentPosition.E;
      newPosition.W = currentPosition.S;
    }

    if (direction === -1) {
      newPosition.N = currentPosition.E;
      newPosition.W = currentPosition.N;
      newPosition.S = currentPosition.W;
      newPosition.E = currentPosition.S;
    }

    currentPosition = Object.assign({}, newPosition);
    turns--;
  }

  return newPosition;
}

function rotate(position, direction, degrees) {
  if (degrees < 0 || degrees > 360) {
    throw new Error(
      `Unexpected degrees. Expected a degree value between 0 and 360 but instead received ${degrees}`
    );
  }

  if (direction !== "L" && direction !== "R") {
    throw new Error(
      `Unknown direction. Expected a direction of either 'L' or 'R' but instead received ${direction}`
    );
  }

  let rotationDirection;
  if (direction === "L") rotationDirection = -1;
  if (direction === "R") rotationDirection = 1;

  const isBearing = (position) => ["N", "E", "S", "W"].includes(position);

  const newPosition = isBearing(position)
    ? _rotateBearing(position, rotationDirection, degrees)
    : _rotateAround(position, rotationDirection, degrees);

  return newPosition;
}

// PART 1
(function () {
  console.group("part 1");

  let currentBearing = "E";
  let shipLocation = { N: 0, E: 0, S: 0, W: 0 };

  instructions.forEach((instruction) => {
    const parts = instruction.split(/(\d+)/).filter(Boolean);
    const command = parts[0];
    const value = Number(parts[1]);

    switch (command) {
      case "N":
      case "E":
      case "S":
      case "W":
        shipLocation[command] += value;
        break;
      case "L":
      case "R":
        currentBearing = rotate(currentBearing, command, value);
        break;
      case "F":
        shipLocation[currentBearing] += value;
        break;
      default:
        break;
    }
  });

  const { N, E, S, W } = shipLocation;
  const manhattanDistance = Math.abs(N - S) + Math.abs(E - W);
  console.log(`Manhattan distance ->`, manhattanDistance);

  // FOR USE WITH testInput.txt
  // assert.equal(manhattanDistance, 25);

  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");

  let shipLocation = { N: 0, E: 0, S: 0, W: 0 };
  let waypointLocation = { N: 1, E: 10, S: 0, W: 0 };

  instructions.forEach((instruction) => {
    const parts = instruction.split(/(\d+)/).filter(Boolean);
    const command = parts[0];
    const value = Number(parts[1]);

    switch (command) {
      case "N":
      case "E":
      case "S":
      case "W":
        waypointLocation[command] += value;
        break;
      case "L":
      case "R":
        waypointLocation = rotate(waypointLocation, command, value);
        break;
      case "F":
        shipLocation = {
          N: shipLocation.N + waypointLocation.N * value,
          E: shipLocation.E + waypointLocation.E * value,
          S: shipLocation.S + waypointLocation.S * value,
          W: shipLocation.W + waypointLocation.W * value,
        };
        break;
      default:
        break;
    }
  });

  const { N, E, S, W } = shipLocation;
  const manhattanDistance = Math.abs(N - S) + Math.abs(E - W);
  console.log(`Manhattan distance ->`, manhattanDistance);

  // FOR USE WITH testInput.txt
  // assert.equal(manhattanDistance, 286);

  console.groupEnd();
})();
