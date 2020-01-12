const Benchmark = require("benchmark");
const chalk = require("chalk");

/**
 * @param {number} min
 * @param {number=} max
 * @returns {number[]}
 */
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

/**
 * @param {string} name
 * @returns {Benchmark.Suite}
 */
exports.suite = name => {
  return new Benchmark.Suite()
    .on("start", () => {
      console.log(chalk.white.bold(name));
    })
    .on("complete", () => {
      console.log();
    })
    .on("cycle", event => {
      let bench = event.target;
      if (bench.error) {
        console.log(`  ${bench.name}  ${chalk.red.inverse(" ERROR ")}`);
        console.log(chalk.red(bench.error.stack));
      } else {
        let ops = Math.floor(bench.hz).toLocaleString();
        let rme = bench.stats.rme.toFixed(2);
        console.log(`  ${bench.name}:`, chalk.gray(`${ops} op/s (±${rme}%)`));
      }
    });
};
