const fs = require("fs");
const path = require("path");

const input = fs.readFileSync("passports.txt").toString();
const passports = input
  .split("\n\n")
  .filter((line) => line !== "\n")
  .map((line) => line.replace(/\n/g, " "))
  .map(parsePassports);

function parsePassports(passport) {
  const keyValues = passport.split(" ");

  const passportObj = {};
  keyValues.forEach((kv) => {
    const [key, value] = kv.split(":");
    passportObj[key] = value;
  });

  return passportObj;
}

const VALID_KEYS = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid", "cid"];
const IGNORE_KEYS = { cid: true };
const SEPARATOR = ":";
const validKeysFingerprint = VALID_KEYS.sort()
  .filter((key) => IGNORE_KEYS[key] === undefined)
  .join(SEPARATOR);

function checkAllKeysPresent(passport) {
  const passportKeys = Object.keys(passport).filter(
    (key) => IGNORE_KEYS[key] === undefined // only consider these keys
  );

  const keyFingerprint = passportKeys.sort().join(SEPARATOR);
  return validKeysFingerprint === keyFingerprint;
}

// PART 1
(function () {
  console.group("part 1");
  console.log(`${passports.length} passports to check`);

  const passportsWithAllKeysPresent = passports.filter(checkAllKeysPresent);

  console.log(`${passportsWithAllKeysPresent.length} valid passports`);
  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");
  console.log(`${passports.length} passports to check`);

  const passportsWithAllKeysPresent = passports.filter(checkAllKeysPresent);
  const validPassports = passportsWithAllKeysPresent.filter(validatePassport);

  console.log(`${validPassports.length} valid passports`);
  console.groupEnd();

  function validatePassport(passport) {
    const checks = {
      byr: new RegExp(/^(19[2-9][0-9]|200[0-2])$/),
      iyr: new RegExp(/^(201[0-9]|2020)$/),
      eyr: new RegExp(/^(202[0-9]|2030)$/),
      hgt: new RegExp(/^(1[5-8][0-9]|19[0-3])cm|(59|6[0-9]|7[0-6])in$/),
      hcl: new RegExp(/^#([0-9a-f]){6}$/),
      ecl: new RegExp(/^(amb|blu|brn|gry|grn|hzl|oth)$/),
      pid: new RegExp(/^[0-9]{9}$/),
      cid: new RegExp(),
    };

    let isValid = true;
    for (let [key, val] of Object.entries(passport)) {
      isValid = checks[key].test(val);

      if (isValid === true) continue;
      else return false;
    }

    return true;
  }
})();
