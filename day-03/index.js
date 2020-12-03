const fs = require("fs");
const path = require("path");

(function () {
  const input = fs.readFileSync("map.txt").toString();
  const lines = input.split("\n").filter((line) => line !== "\n");

  // update these 2 values for each run through down the slope
  const rightStepSize = 1;
  const downStepSize = 2;

  const rowLength = lines[0].length;
  const rowCount = lines.length;
  console.log(`each row is ${rowLength} long`);

  const downSteps = downStepSize * rowCount;
  const rightSteps = rightStepSize * rowCount;
  console.log(
    `we need to make ${downSteps} down steps and ${rightSteps} right steps`
  );

  const mapMultiplier = Math.max(downSteps, rightStepSize);

  let repeatCount = Math.floor((mapMultiplier * rowCount) / rowLength);

  const remainder = rowCount % rowLength;
  if (remainder > 0) {
    repeatCount += 1;
  }

  console.log(`we need the map to repeat right ${repeatCount} times`);

  // create the full map
  const mapLines = lines.map((s) => s.repeat(repeatCount));
  const path = [];

  for (
    let i = 0, right = rightStepSize;
    i < mapLines.length;
    i += downStepSize, right += rightStepSize
  ) {
    const nextStep = i + downStepSize;
    if (nextStep >= mapLines.length) {
      break;
    }

    path.push(mapLines[nextStep][right]);
  }

  const treeCount = path.reduce(
    (prev, curr) => (curr === "#" ? prev + 1 : prev),
    0
  );
  console.log(`enountered ${treeCount} trees`);
})();

// RESULTs FOR PART 2
// 90,244,97,92,48
