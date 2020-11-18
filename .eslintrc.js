module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
	},
	env: {
		browser: true,
		commonjs: true,
		es6: true,
	},
	settings: {
		react: {
			version: "detect",
		},
	},
	extends: [
		"plugin:@typescript-eslint/recommended",
		"prettier",
		"prettier/@typescript-eslint",
	],
	rules: {
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-var-requires": "off",
	},
};
