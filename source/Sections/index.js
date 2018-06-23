import Point from './Point';
import sequence from '../helpers/sequence';

const mapMax = [
	59, // max second in minute
	59, // max minute in hour
	23, // max hour in day
	31, // max day in month
	12, // max month in year
	7 // max day in week
];

export default class {
	constructor(string, type) {
		if (typeof string !== 'string') {
			throw new Error(ERROR_INPUT_MUST_BE_A_STRING);
		}
		this._type = type;
		const subs = string
			.split(',')
			.map(item => new Point(item, mapMax[type]))
			.reduce((result, point) => result.concat(Array.from(point)), []);

		const uniq = new Set(subs);

		// Normalize to JS date ranges
		switch (type) {
			case 4: {
				Array.from(sequence(1, 12))
					.forEach((item) => {
						if (uniq.has(item)) {
							uniq.add(item - 1);
							uniq.delete(item);
						}
					});
				break;
			}
			case 5: {
				if (uniq.has(7)) {
					uniq.add(0);
					uniq.delete(7);
				}
				break;
			}
		}

		this._values = (Array.from(uniq)).sort((a, b) => a - b);
		this.rewind();
	}

	has(value) {
		return this._values.indexOf(value) !== -1;
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
