const fs = require("fs");
const path = require("path");

function parseRule(line) {
  const [rule, password] = line.split(":").map((str) => str.trim());
  const [range, char] = rule.split(" ");
  const [min, max] = range.split("-");
  return { char, password, min: parseInt(min, 10), max: parseInt(max, 10) };
}

// PART 1
(function () {
  console.group("part 1");

  const input = fs.readFileSync("passwords.txt").toString();
  const entries = input
    .split("\n")
    .filter((line) => line !== "\n")
    .map(parseRule);

  console.log(`${entries.length} passwords`);

  const validPasswords = entries.filter((entry) => {
    const { char, min, max, password } = entry;

    // why was this regex wrong (compared to the one below)?
    const wrongRegExp = new RegExp(`(${char}[^${char}]*?){${min},${max}}`);

    const check = new RegExp(
      `^[^${char}]*(?:${char}[^${char}]*){${min},${max}}$`
    );

    return check.test(password);
  });

  console.log(`${validPasswords.length} valid passwords`);
  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");
  const input = fs.readFileSync("passwords.txt").toString();
  const entries = input
    .split("\n")
    .filter((line) => line !== "\n")
    .map(parseRule);

  console.log(`${entries.length} passwords`);

  const validPasswords = entries.filter((entry) => {
    const { min: pos1, max: pos2, char, password } = entry;

    const result1 = new RegExp(`^.{${pos1 - 1}}${char}`).test(password);
    const result2 = new RegExp(`^.{${pos2 - 1}}${char}`).test(password);

    return result1 !== result2;
  });

  console.log(`${validPasswords.length} valid passwords`);
  console.groupEnd();
})();
