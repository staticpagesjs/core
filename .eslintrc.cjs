module.exports = {
	'env': {
		'jest/globals': true,
		'node': true,
		'browser': true,
		'es2021': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:jest/recommended',
	],
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 13,
		'sourceType': 'module'
	},
	'plugins': [
		'@typescript-eslint'
	],
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		]
	}
};
