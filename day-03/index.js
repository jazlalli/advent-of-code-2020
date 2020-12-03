const fs = require("fs");
const path = require("path");

// PART 1
(function () {
  console.group("part 1");
  const input = fs.readFileSync("map.txt").toString();
  const lines = input.split("\n").filter((line) => line !== "\n");

  const treeCount = countTreesOnTheWayDown(lines, 3, 1);
  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");
  const input = fs.readFileSync("map.txt").toString();
  const lines = input.split("\n").filter((line) => line !== "\n");

  const treeCounts = [
    countTreesOnTheWayDown(lines, 1, 1),
    countTreesOnTheWayDown(lines, 3, 1),
    countTreesOnTheWayDown(lines, 5, 1),
    countTreesOnTheWayDown(lines, 7, 1),
    countTreesOnTheWayDown(lines, 1, 2),
  ];

  let logLine = "";
  const finalAnswer = treeCounts.reduce((left, right, idx) => {
    logLine += idx === 1 ? `${left} * ${right} ` : `* ${right} `;
    return left * right;
  });

  console.log(`ANSWER: ${logLine}= ${finalAnswer}`);
  console.groupEnd();
})();

function countTreesOnTheWayDown(mapLines, rightStepSize, downStepSize) {
  const rowLength = mapLines[0].length;
  const rowCount = mapLines.length;

  const downSteps = downStepSize * rowCount;
  const rightSteps = rightStepSize * rowCount;
  console.log(
    `> we need to make ${downSteps} down steps and ${rightSteps} right steps`
  );

  const mapMultiplier = Math.max(downSteps, rightStepSize);

  let repeatCount = Math.floor((mapMultiplier * rowCount) / rowLength);

  const remainder = rowCount % rowLength;
  if (remainder > 0) {
    repeatCount += 1;
  }

  console.log(`> repeat map right ${repeatCount} times`);

  // create the full map
  const fullMap = mapLines.map((s) => s.repeat(repeatCount));
  const path = [];

  for (
    let i = 0, right = rightStepSize;
    i < fullMap.length;
    i += downStepSize, right += rightStepSize
  ) {
    const nextStep = i + downStepSize;
    if (nextStep >= fullMap.length) {
      break;
    }

    path.push(fullMap[nextStep][right]);
  }

  const treeCount = path.reduce(
    (prev, curr) => (curr === "#" ? prev + 1 : prev),
    0
  );

  console.log(`> encountered ${treeCount} trees`);
  console.log(`---`);
  return treeCount;
}
