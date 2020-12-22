/*
  most of this is based on https:github.com/jamiebuilds/the-super-tiny-compiler
  with minor modifications for this specific use-case
*/
module.exports = {};
module.exports.tokenize = tokenize;
module.exports.parse = parse;
module.exports.transform = transform;
module.exports.evaluate = evaluate;
module.exports._containsExpression = containsExpression;

function tokenize(expression) {
  expression = expression.trim();

  const tokens = [];
  let token = "";

  for (let i = 0; i < expression.length; i++) {
    token += expression[i].trim();
    const nextChar = expression[i + 1];
    const NUMBER = /\d/;

    if (NUMBER.test(token) && NUMBER.test(nextChar)) {
      continue;
    }

    if (NUMBER.test(token) && !NUMBER.test(nextChar)) {
      tokens.push({ type: "NUMBER", value: Number(token) });
      token = "";
      continue;
    }

    if (token === "(" || token === ")") {
      tokens.push({
        type: token === "(" ? "OPENPARENTHESIS" : "CLOSEPARENTHESIS",
        value: token,
      });
      token = "";
    }

    if (token === "*" || token === "+") {
      tokens.push({ type: "OPERATOR", value: token });
      token = "";
    }
  }

  return tokens;
}

function parse(tokens) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    if (token.type === "NUMBER") {
      current++;
      return {
        type: "NumberLiteral",
        value: token.value,
      };
    }

    if (token.type === "OPERATOR") {
      current++;
      return {
        type: "Operator",
        value: token.value,
      };
    }

    if (token.type === "OPENPARENTHESIS") {
      let node = {
        type: "Expression",
        body: [],
      };

      token = tokens[++current];

      while (token.type !== "CLOSEPARENTHESIS") {
        node.body.push(walk());
        token = tokens[current];
      }

      current++;
      return node;
    }
  }

  let ast = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

function traverse(ast, visitor) {
  function traverseArray(nodeArray, parent) {
    nodeArray.forEach((child) => traverseNode(child, parent));
  }

  function traverseNode(node, parent) {
    let methods = visitor[node.type];

    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;

      case "Expression":
        traverseArray(node.body, node);
        break;

      case "NumberLiteral":
      case "Operator":
        break;
    }

    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  traverseNode(ast, null);
}

function transform(ast) {
  let newAst = {
    type: "Program",
    body: [],
  };

  // context is the new asts body, so push stuff into it to contruct
  // the new ast.
  ast._context = newAst.body;

  traverse(ast, {
    NumberLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: "NumberLiteral",
          value: node.value,
        });
      },
    },
    Operator: {
      enter(node, parent) {
        parent._context.push({
          type: "Operator",
          value: node.value,
        });
      },
    },
    Expression: {
      enter(node, parent) {
        const hasNestedExpression = containsExpression(node.body);

        node._context = [];

        // if we have no more expressions below then evaluate it's body
        // and replace the expression with a NumberLiteral of the result
        if (hasNestedExpression === false) {
          const value = evaluate(node.body);
          parent._context.push({ type: "NumberLiteral", value });
        }
      },
      exit(node, parent) {
        const hasNestedExpression = containsExpression(node.body);

        if (hasNestedExpression === true) {
          node.body = node._context;
          parent._context.push(node);
        }
      },
    },
  });

  return newAst;
}

function containsExpression(nodes) {
  const hasNestedExpression = nodes.map((n) => n.type).includes("Expression");
  return hasNestedExpression;
}

// given a flat list of nodes containing only NumberLiterals or Operators
// this function will evaluate it
function evaluate(nodes) {
  let idx = 0;
  let value = 0;

  while (idx < nodes.length) {
    const currentNode = nodes[idx];
    const nextNode = nodes[idx + 1];
    if (nextNode === undefined) {
      break;
    }

    if (idx === 0) {
      value = currentNode.value;
    }
    if (currentNode.value === "+") {
      value += nextNode.value;
      idx++;
    }
    if (currentNode.value === "*") {
      value *= nextNode.value;
      idx++;
    }

    idx++;
  }

  return value;
}
