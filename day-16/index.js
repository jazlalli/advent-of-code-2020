const fs = require("fs");
const path = require("path");
const assert = require("assert").strict;

let [rules, myTicket, nearbyTickets] = fs
  .readFileSync("tickets.txt")
  .toString()
  .split("\n\n")
  .filter((line) => line !== "\n");

rules = rules.split("\n");
myTicket = myTicket
  .split("\n")
  .slice(1, myTicket.length - 1)
  .flatMap((t) => t.split(",").map(Number));
nearbyTickets = nearbyTickets
  .split("\n")
  .slice(1, nearbyTickets.length - 1)
  .map((t) => t.split(",").map(Number));

/*
  given the raw list of rules, returns the set of valid values for each field,
  in the form

  [field name] => Set[values]
 */
function constructValidNumbersByField(rules) {
  const fieldRanges = rules.map((rule) => rule.split(":"));
  const fields = fieldRanges.flatMap((fr) => fr[0].trim());
  const ranges = fieldRanges.flatMap((fr) => fr[1].trim());

  const rangeMinMax = ranges
    .flatMap((rule) => rule.match(/[0-9]+\-[0-9]+/g))
    .map((range) => range.split("-").map(Number));

  const validNumbersByField = new Map();
  let validNumbers = [];

  for (let i = 0; i < rangeMinMax.length; i += 2) {
    let [min1, max1] = rangeMinMax[i];
    let [min2, max2] = rangeMinMax[i + 1];

    while (min1 <= max1) {
      validNumbers.push(min1);
      min1++;
    }

    while (min2 <= max2) {
      validNumbers.push(min2);
      min2++;
    }

    validNumbersByField.set(fields[i / 2], new Set(validNumbers));
    validNumbers = [];
  }

  return validNumbersByField;
}

/*
  merges all values from all fields into a single set, allowing easy
  identification of invalid values anywhere in a ticket
 */
function constructFullValidNumberSet(rules) {
  const validNumbersByField = constructValidNumbersByField(rules);

  let allValidNumbers = [];
  for (let [field, values] of validNumbersByField) {
    allValidNumbers = [...allValidNumbers, ...Array.from(values)];
  }

  const uniqueValidNumbers = new Set(allValidNumbers);
  return uniqueValidNumbers;
}

// PART 1
(function () {
  console.group("part 1");

  const uniqueValidNumbers = constructFullValidNumberSet(rules);
  const invalidTicketValues = nearbyTickets.flatMap((ticket) =>
    ticket.filter((num) => uniqueValidNumbers.has(num) === false)
  );

  const errorRate = invalidTicketValues.reduce((curr, next) => curr + next, 0);
  console.log(`ticket scanning error rate -> ${errorRate}`);

  // FOR USE WITH test1.txt
  // assert.equal(errorRate, 71);

  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");

  // obtain only the valid tickets
  const uniqueValidNumbers = constructFullValidNumberSet(rules);
  const validTickets = nearbyTickets.filter((ticket) =>
    ticket.every((num) => uniqueValidNumbers.has(num))
  );

  // transpose tickets to get arrays of common field values
  const ticketFieldValues = validTickets[0].map((_, fieldIdx) =>
    validTickets.map((ticket) => ticket[fieldIdx])
  );

  // identify all possible fields for each column
  const validNumbersByField = constructValidNumbersByField(rules);
  const possibleFields = ticketFieldValues.map((field, idx) => {
    const candidates = [];

    // check valid numbers by field and when all values match record the field
    for (let [fieldName, values] of validNumbersByField) {
      if (field.every((val) => values.has(val))) {
        candidates.push(fieldName);
      }
    }

    return candidates;
  });

  // apply process of elimination, starting with the list of potential fields
  // which contains only one value. we can that from all other lists, which
  // reduces another list to only one possible candidate, and so on and so on
  let finalFields = [];
  let noOfPasses = 0;

  while (noOfPasses < 20) {
    for (let i = 0; i < possibleFields.length; i++) {
      let nextFieldToEliminate = possibleFields[i].filter(
        (f) => finalFields.includes(f) === false
      );

      if (nextFieldToEliminate.length === 1) {
        finalFields[i] = nextFieldToEliminate[0];
        possibleFields[i] = []; // we ignore this field from here on
        break;
      }
    }

    noOfPasses++;
  }

  // grab the departure fields and the corresponding values from my ticket
  const departureFields = [];
  for (let i = 0; i < finalFields.length; i++) {
    const field = finalFields[i];
    if (/^departure/.test(field)) {
      departureFields.push(myTicket[i]);
    }
  }

  // calculate the product
  const result = departureFields.reduce((curr, next) => curr * next, 1);
  console.log("product of departure fields ->", result); // 3429967441937

  console.groupEnd();
})();
