const fs = require("fs");
const path = require("path");

const input = fs.readFileSync("map.txt").toString();
const lines = input.split("\n").filter((line) => line !== "\n");

// PART 1
(function () {
  console.group("part 1");
  const treeCount = countTreesOnTheWayDown(lines, 3, 1);
  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");

  const treeCounts = [
    countTreesOnTheWayDown(lines, 1, 1),
    countTreesOnTheWayDown(lines, 3, 1),
    countTreesOnTheWayDown(lines, 5, 1),
    countTreesOnTheWayDown(lines, 7, 1),
    countTreesOnTheWayDown(lines, 1, 2),
  ];

  let sumLine = "";
  const finalAnswer = treeCounts.reduce((left, right, idx) => {
    sumLine += idx === 1 ? `${left} * ${right}` : ` * ${right}`;
    return left * right;
  });

  console.log(`---`);
  console.log(`ANSWER: ${sumLine} = ${finalAnswer}`);
  console.groupEnd();
})();

function countTreesOnTheWayDown(mapLines, rightStepSize, downStepSize) {
  const fullMap = makeFullMap(mapLines, rightStepSize, downStepSize);
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
  return treeCount;
}

function makeFullMap(inputMap, rightStepSize, downStepSize) {
  const rowLength = inputMap[0].length;
  const rowCount = inputMap.length;
  const downSteps = downStepSize * rowCount;
  const rightSteps = rightStepSize * rowCount;
  console.log(
    `> we need to make ${downSteps} down steps and ${rightSteps} right steps`
  );

  const mapMultiplier = Math.max(downSteps, rightStepSize);
  const remainder = rowCount % rowLength;

  let mapRepeatCount = Math.floor((mapMultiplier * rowCount) / rowLength);
  if (remainder > 0) {
    mapRepeatCount += 1;
  }

  console.log(`> repeat map right ${mapRepeatCount} times`);

  // create the full map
  const fullMap = inputMap.map((s) => s.repeat(mapRepeatCount));
  return fullMap;
}
