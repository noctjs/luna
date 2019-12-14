const { Suite } = require("benchmark");
const chalk = require("chalk");

exports.range = (min, max) => {
  if (typeof max === "undefined") {
    max = min;
    min = 0;
  }

  const array = [];
  for (let i = min; i < max; i++) {
    array.push(i);
  }

  return array;
};

exports.bench = name => {
  const suite = new Suite();

  suite.on("start", () => {
    console.log(chalk.white.bold(name));
  });

  suite.on("cycle", event => {
    const { target } = event;
    let text;
    if (target.error) {
      text = `  ${chalk.red("✕")} ${chalk.white(target.name)}`;
    } else {
      const ops = Math.floor(target.hz).toLocaleString();
      const rme = target.stats.rme.toFixed(2);
      text =
        `  ${chalk.green("✓")} ${chalk.white(target.name)} ` +
        chalk.gray(`[ ${ops} op/s (±${rme}%) ]`);
    }

    console.log(text);
  });

  suite.on("complete", () => {
    console.log();
  });

  return suite;
};
