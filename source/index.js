export const ERROR_INPUT_MUST_BE_A_STRING = 'Input must be a string';
export const ERROR_INPUT_MUST_HAVE_6_SECTIONS = 'Input must have 6 sections separated by spaces';

import Sections from './Sections';
import synonyms from './helpers/synonyms';

export default class {
	/**
	 * Parse cron time string
	 * @constructor crontime
	 * @param {String} string - string that represents period in cron format
	 * @example
	 * import CronTime from 'crontime';
	 * let i = new CronTime('0-1,4 0 0 * * *');
	 * i.start = '1970-01-01 00:00:00.000Z+0'; // Not mandatory
	 * i.end = '1970-01-01 23:59:59.000Z+0'; // Not mandatory
	 *
	 * const next = i.next()
	 * // 1970-01-01T00:00:00.000Z;
	 *
	 * const portion = i.nextPortion(2);
	 * // [ '1970-01-01T00:00:01.000Z', '1970-01-01T00:00:04.000Z'] ;
	 */
	constructor(string) {
		if (typeof string !== 'string') {
			throw new Error(`${ERROR_INPUT_MUST_BE_A_STRING}. Got: ${string}`);
		}

		this._string = synonyms(string);

		const sections = this._string.split(' ');
		if (sections.length !== 6) {
			throw new Error(`${ERROR_INPUT_MUST_HAVE_6_SECTIONS}: ${string}`);
		}

		this._sections = sections.map((item, index) => new Sections(item, index));

		this.rewind();
	}

	get start() {
		return this._start;
	}

	set start(value) {
		this._start = new Date(value);
	}

	get end() {
		return this._end;
	}

	set end(value) {
		this._end = new Date(value);
	}

	rewind() {
		this.position = this.start ? this.start : new Date(0);
		this._sections.forEach(item => item.rewind());
	}

	get position() {
		return this._position;
	}

	set position(value) {
		this._position = new Date(value);
	}

	* _next() {
		const iterable = this._nextIterable ? this._nextIterable : this._nextIterable = this[Symbol.iterator]();
		yield* iterable;
		delete this._nextIterable;
	}

	next() {
		return this._next().next().value;
	}

	/**
	 * @param {Number} size - size of data portion
	 * @return {Array.Date} - portion of next match to `pattern` times
	 */
	nextPortion(size = 1) {
		return Array.from(new Array(size),
			() => {
				const next = this.next();
				return next ? new Date(next) : undefined;
			}, this)
			.filter(item => item !== undefined);
	}

	/**
	 * @return {String} - string representation of cron period
	 */
	toString() {
		return this._string;
	}

	* [Symbol.iterator]() {
		const [S, M, H, d, m, a] = this._sections;
		while (this._position <= this.end || !this.end) {
			if (
				// Match to day of week or day of month
				m.has(this._position.getUTCMonth()) && (a.has(this._position.getUTCDay()) && d.has(this._position.getUTCDate()))
			) {
				// Iterate hours, minutes & seconds
				for (const hour of H) {
					for (const min of M) {
						for (const sec of S) {
							this._position.setUTCHours(hour, min, sec);
							yield this.position;
						}
						S.rewind();
					}
					M.rewind();
				}
				H.rewind();
			}

			// Go to the next day
			this.position.setDate(this._position.getDate() + 1);
		}
	}
}

/**
 npm install --save crontime
 @name Installation
 */
