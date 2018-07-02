const sequence = require('../../helpers/sequence');

const ERROR_INPUT_MUST_BE_A_STRING = 'Input must be a string';
const ERROR_INPUT_MUST_BE_A_NUMBER = 'Input must be a number';
const ERROR_STRUCTURE = 'Invalid structure';
const ERROR_OUT_OF_RANGE = 'Out of range';
const ERROR_INVERSED_VALUES = 'Inversed values';

const patternOne = /^\d+$/;
const patternInterval = /^\d+-\d+$/;

module.exports = class {
	constructor(string, max) {
		if (typeof string !== 'string') {
			throw new Error(`${ERROR_INPUT_MUST_BE_A_STRING}. Got: `, string);
		}

		if (typeof max !== 'number') {
			throw new Error(`${ERROR_INPUT_MUST_BE_A_NUMBER}. Got:`, max);
		}

		const conf = string.split('/');
		switch (conf.length) {
			case 1: {
				const [start, end] = this._parseInterval(conf[0], max);
				this._values = Array.from(Array(end - start + 1), (item, index) => start + index);
				break;
			}
			case 2: {
				const [start, end] = this._parseInterval(conf[0], max);
				const step = this._parse(conf[1]);
				this._values = Array.from(sequence(start, end, step));
				break;
			}
			default: {
				throw new Error(`${ERROR_STRUCTURE}: ${string}`);
			}
		}

		this.rewind();
	}

	_parseInterval(string, max) {
		switch (true) {
			case string === '*': {
				return [0, max];
			}
			case patternOne.test(string): {
				const start = this._parse(string);
				const end = start;
				if (end > max) {
					throw new Error(`${ERROR_OUT_OF_RANGE}: ${string}`);
				}
				return [start, end];
			}
			case patternInterval.test(string): {
				const interval = string.split('-');
				const start = this._parse(interval[0]);
				const end = this._parse(interval[1]);
				if (start > end) {
					throw new Error(`${ERROR_INVERSED_VALUES}: ${string}`);
				}
				if (end > max) {
					throw new Error(`${ERROR_OUT_OF_RANGE}: ${string}`);
				}
				return [start, end];
			}
			default: {
				throw new Error(`${ERROR_STRUCTURE}: ${string}`);
			}
		}
	}

	_parse(string) {
		let value = Number.parseInt(string);
		if (isNaN(value)) {
			throw new Error(`${ERROR_STRUCTURE}: ${string}`);
		}
		return value;
	}

	rewind() {
		this._position = 0;
	}

	* [Symbol.iterator]() {
		for (const l = this._values.length; this._position < l; this._position++) {
			yield this._values[this._position];
		}
	}
}

module.exports.ERROR_INPUT_MUST_BE_A_STRING = ERROR_INPUT_MUST_BE_A_STRING;
module.exports.ERROR_INPUT_MUST_BE_A_NUMBER = ERROR_INPUT_MUST_BE_A_NUMBER;
module.exports.ERROR_STRUCTURE = ERROR_STRUCTURE;
module.exports.ERROR_OUT_OF_RANGE = ERROR_OUT_OF_RANGE;
module.exports.ERROR_INVERSED_VALUES = ERROR_INVERSED_VALUES;
