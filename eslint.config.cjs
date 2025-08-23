// eslint.config.cjs
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const importPlugin = require("eslint-plugin-import");
const unusedImports = require("eslint-plugin-unused-imports");

module.exports = [
    { ignores: ["dist/**", "node_modules/**"] },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            import: importPlugin,
            "unused-imports": unusedImports,
        },
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-vars": ["warn", { vars: "all", args: "after-used", argsIgnorePattern: "^_" }],
            "unused-imports/no-unused-imports": "warn",
            "import/order": ["warn", { "newlines-between": "always" }],
            // "no-console": "warn",
            // "import/order": "warn",
            // "unused-imports/no-unused-vars": "warn"
            "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
        },
    },
];


// // eslint.config.js
// import tsParser from "@typescript-eslint/parser";
// import tsPlugin from "@typescript-eslint/eslint-plugin";
// import importPlugin from "eslint-plugin-import";
// import unusedImports from "eslint-plugin-unused-imports";
//
// export default [
//   {
//     ignores: [
//       "dist/**",
//       "node_modules/**",
//       "*.config.js",
//       "*.config.ts",
//     ],
//   },
//   {
//     files: ["**/*.ts", "**/*.tsx"],
//     languageOptions: {
//       parser: tsParser,
//       parserOptions: {
//         project: "./tsconfig.json",
//         sourceType: "module",
//       },
//     },
//     plugins: {
//       "@typescript-eslint": tsPlugin,
//       import: importPlugin,
//       "unused-imports": unusedImports,
//     },
//     rules: {
//       // Variables inutilisées
//       "@typescript-eslint/no-unused-vars": "off",
//       "unused-imports/no-unused-vars": [
//         "warn",
//         { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
//       ],
//       "unused-imports/no-unused-imports": "warn",
//
//       // Ordre des imports
//       "import/order": ["warn", { "newlines-between": "always" }],
//
//       // Style
//       "no-console": "warn",
//       "@typescript-eslint/explicit-function-return-type": "off",
//     },
//   },
// ];
