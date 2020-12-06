const fs = require("fs");
const path = require("path");

const input = fs.readFileSync("yesanswers.txt").toString();
const groups = input.split("\n\n").filter((line) => line !== "\n");

// PART 1
(function () {
  console.group("part 1");

  const sumOfYesAnswers = groups
    .map((group) => group.replace(/\n/g, "")) // concat every persons answers
    .map((answers) => new Set(answers.split("")).size) // count how many unique yes'
    .reduce((acc, curr) => acc + curr); // sum the counts

  console.log(`count of distinct 'yes' answers is ${sumOfYesAnswers}`);

  // FOR USE WITH TEST DATA
  // const assert = require("assert").strict;
  // assert.equal(sumOfYesAnswers, 11);

  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");

  const questionsAlwaysAnsweredYes = groups
    .map((group) => group.split("\n"))
    .map((groupAnswers) => {
      // find the letters that appear in every persons answers
      return groupAnswers.reduce((allYesAnswers, personsAnswers) => {
        const yesAnswers = new Set(allYesAnswers.split(""));
        return personsAnswers
          .split("")
          .filter((letter) => yesAnswers.has(letter))
          .join("");
      });
    });

  const numberOfQuestionsAlwaysAnsweredYes = questionsAlwaysAnsweredYes
    .map((questions) => questions.length)
    .reduce((acc, curr) => acc + curr);

  console.log(
    `count of questions with all 'yes' answers is ${numberOfQuestionsAlwaysAnsweredYes}`
  );

  // FOR USE WITH TEST DATA
  // const assert = require("assert").strict;
  // assert.equal(numberOfQuestionsAlwaysAnsweredYes, 6);

  console.groupEnd();
})();
