import replace from "@rollup/plugin-replace";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

let hasDeclarations = false;

function createConfig({ format, output, replacements = {} }) {
  let shouldEmitDeclarations = !hasDeclarations;
  if (shouldEmitDeclarations) {
    hasDeclarations = true;
  }

  return {
    input: "./src/index.ts",
    output: {
      format,
      file: output,
      esModule: false,
      interop: false,
      treeshake: {
        propertyReadSideEffects: false
      }
    },
    plugins: [
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: shouldEmitDeclarations,
            declarationDir: "./types"
          }
        }
      }),
      replace(replacements),
      terser({
        ecma: 9,
        compress: {
          passes: 10,
          pure_getters: true,
          unsafe_arrows: true,
          unsafe_math: true,
          unsafe_methods: true
        },
        mangle: {
          properties: {
            regex: /^_/
          }
        },
        output: {
          wrap_func_args: false
        }
      })
    ]
  };
}

export default [
  createConfig({
    output: "dist/luna.esm.js",
    format: "esm"
  }),
  createConfig({
    output: "dist/luna.cjs.js",
    format: "cjs"
  })
];
