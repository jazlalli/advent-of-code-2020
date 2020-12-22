const fs = require("fs");
const path = require("path");
const assert = require("assert").strict;
const {
  tokenize,
  parse,
  transform,
  evaluate,
  _containsExpression,
} = require("./compiler");

// test data
const testInput = fs
  .readFileSync("testInput.txt")
  .toString()
  .split("\n")
  .filter((line) => line !== "\n")
  .map((line) => {
    const [sum, answer] = line.split("=");
    return { sum: sum.trim(), answer: Number(answer) };
  });

const TEST_CASE = 5;
const testExpressions = testInput.map((i) => i.sum);
const testAnswers = testInput.map((i) => i.answer);
// end test data

function solve(expression) {
  const tokens = tokenize(expression);
  const ast = parse(tokens);

  // constructs a new ast with the nested-most expressions collapsed
  let newAst = transform(ast);
  let moreExpressions = _containsExpression(newAst.body);

  // keep doing a pass, each one collapses expressions (i.e. stuff
  // in parentheses) by one level of nesting
  while (moreExpressions) {
    newAst = transform(newAst);
    moreExpressions = _containsExpression(newAst.body);
  }

  // we now have a completely flat expression tree and can evaluate it
  const answer = evaluate(newAst.body);
  return answer;
}

// PART 1
(function () {
  console.group("part 1");

  const expressions = fs
    .readFileSync("expressions.txt")
    .toString()
    .split("\n")
    .filter((line) => line !== "\n");

  const values = expressions.map(solve);
  const answer = values.reduce((curr, next) => curr + next, 0);
  console.log("answer ->", answer); // 1402255785165

  // for use with test cases
  // assert.equal(answer, testAnswers[TEST_CASE]);

  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");
  console.groupEnd();
})();
