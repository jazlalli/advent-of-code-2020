const fs = require("fs");
const path = require("path");

const input = fs.readFileSync("luggagerules.txt").toString();
const ruleLines = input.split("\n").filter((line) => line !== "\n");

function createBagTree(includeQuantities = false) {
  const bagTree = new Map();

  // extract just the meaningful info out of the rules
  const rules = ruleLines.map((rule) => {
    let parts = rule
      .split(/(\d)/)
      .map((substr) =>
        substr.replace(/(bags?|contain|no|other|\,|\.)/g, "").trim()
      );

    return parts;
  });

  for (var i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const parentBag = rule.splice(0, 1)[0];

    if (bagTree.has(parentBag) === false) {
      // if we want to track the quantities as well as the bag,
      // then we want a Map, if only the bag, then a Set will suffice
      bagTree.set(parentBag, includeQuantities ? new Map() : new Set());
    }

    // each pair of items gives us the data we need, so iterate index by 2
    for (let j = 0; j < rule.length; j += 2) {
      const bagName = rule[j + 1];
      const bagQuantity = parseInt(rule[j], 10);
      const containingBag = bagTree.get(parentBag);

      if (includeQuantities) {
        containingBag.set(bagName, bagQuantity);
      } else {
        containingBag.add(bagName);
      }
    }
  }

  return bagTree;
}

function findContainingBags(bagTree, bagColour) {
  let containingBags = [];

  for (let [parentBag, contents] of bagTree.entries()) {
    if (contents.has(bagColour)) {
      containingBags.push(parentBag);
    }
  }

  containingBags = [
    ...containingBags,
    ...containingBags.flatMap((colour) => findContainingBags(bagTree, colour)),
  ];

  return Array.from(new Set(containingBags));
}

function sumBagsInside(bagTree, bag) {
  let totalCount = 0;

  const containingBag = bagTree.get(bag);
  if (containingBag !== null) {
    totalCount += 1;

    for (let [key, quantity] of containingBag.entries()) {
      totalCount += quantity * sumBagsInside(bagTree, key);
    }
  }

  return totalCount;
}

// PART 1
(function () {
  console.group("part 1");

  const bagTree = createBagTree();
  const containingBags = findContainingBags(bagTree, "shiny gold");
  const noOfDistinctContainingBags = containingBags.length;
  console.log(
    `shiny gold bag can end up ${noOfDistinctContainingBags} distinct bags`
  );

  // FOR USE WITH TEST DATA
  // const assert = require("assert").strict;
  // assert.equal(noOfBags, 4);

  console.groupEnd();
})();

// PART 2
(function () {
  console.group("part 2");

  const includeBagQuantities = true;
  const bagTree = createBagTree(includeBagQuantities);

  // the bag we're looking for was itself counted, so subtract 1 from the result
  const sumOfBags = sumBagsInside(bagTree, "shiny gold") - 1;
  console.log(`total number of bags contained is ${sumOfBags}`);

  // FOR USE WITH TEST DATA
  // const assert = require("assert").strict;
  // assert.equal(sumOfBags, 32);

  console.groupEnd();
})();
