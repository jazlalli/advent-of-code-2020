const assert = require("assert").strict;

const data = {
  0: { sequence: "0,3,6", 2020: 436, 30000000: 175594 },
  1: { sequence: "1,3,2", 2020: 1, 30000000: 2578 },
  2: { sequence: "2,1,3", 2020: 10, 30000000: 3544142 },
  3: { sequence: "1,2,3", 2020: 27, 30000000: 261214 },
  4: { sequence: "2,3,1", 2020: 78, 30000000: 6895259 },
  5: { sequence: "3,2,1", 2020: 438, 30000000: 18 },
  6: { sequence: "3,1,2", 2020: 1836, 30000000: 362 },
  // this is the real input
  7: { sequence: "18,11,9,0,5,1", 2020: null, 30000000: null },
};

const TEST_CASE = 7;
const NO_OF_TURNS = 30000000;

(function () {
  const numbers = data[TEST_CASE].sequence.split(",").map(Number);

  /*
    data structure to keep track of numbers spoken, and each turn
    it was spoken on. i.e. after the starting list this will be

    0 => [0]
    3 => [1]
    6 => [2]

    then after the 10th turn it will look like

    0 => [7, 9]
    3 => [4, 5]
    6 => [2]
    1 => [6]
    4 => [8]
   */
  const numberHistory = new Map(numbers.map((n, i) => [n, [i]]));

  console.log("starting with:", numbers);
  const updateProgress = createProgressIndicator();

  for (let i = numbers.length; i < NO_OF_TURNS; i++) {
    updateProgress(Math.round(100 * (i / NO_OF_TURNS)));

    const history = numberHistory.get(numbers[i - 1]);
    const numberToSay =
      history.length > 1
        ? history[history.length - 1] - history[history.length - 2]
        : 0;

    numbers.push(numberToSay);

    // update data of when numbers were spoken
    if (numberHistory.has(numberToSay)) {
      const numHistory = numberHistory.get(numberToSay);
      numHistory.push(i);

      // drop the history before the 2 most recent utterances
      if (numHistory.length > 2) {
        numHistory.shift();
      }
    } else {
      numberHistory.set(numberToSay, [i]);
    }
  }

  console.log(
    `finished! ${numbers.length} numbers spoken, ${numbers.length}th is ${
      numbers[numbers.length - 1]
    }`
  );

  // for use with one of the test cases at top
  // assert.deepEqual(numbers[numbers.length - 1], data[TEST_CASE][NO_OF_TURNS]);
})();

// for de shits and de giggles
function createProgressIndicator() {
  let currentProgress = 0;

  process.stdout.write("game in progress: ");

  return function updateProgress(percentage) {
    const maxLength = Math.round(percentage / 2);
    if (maxLength !== currentProgress) {
      process.stdout.cursorTo(17 + maxLength);
      process.stdout.write("#");
      currentProgress = maxLength;

      if (currentProgress === 50) {
        process.stdout.write("\n");
      }
    }
  };
}
