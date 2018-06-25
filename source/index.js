export const ERROR_INPUT_MUST_BE_A_STRING = 'Input must be a string';
export const ERROR_INPUT_MUST_HAVE_6_SECTIONS = 'Input must have 6 sections separated by spaces';

import Sections from './Sections';
import synonyms from './helpers/synonyms';

export default class {
	/**
	 * Parse cron time string
	 * @constructor CronTime
	 * @param {String} pattern - {@link pattern}
	 * @example
	 * import CronTime from 'cron-time';
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
	constructor(pattern) {
		if (typeof pattern !== 'string') {
			throw new Error(`${ERROR_INPUT_MUST_BE_A_STRING}. Got: ${pattern}`);
		}

		/**
		 * String that represents period in cron format
		 * @example
		 * *  *  *  *  *  *
		 * ┬  ┬  ┬  ┬  ┬  ┬
		 * │  │  │  │  │  └─────────────── day of week (0 - 7) (0 and 7 - represents Sunday)
		 * │  │  │  │  └────────────────── month (1 - 12)
		 * │  │  │  └───────────────────── day of month (1 - 31)
		 * │  │  └──────────────────────── hour (0 - 23)
		 * │  └─────────────────────────── minute (0 - 59)
		 * └────────────────────────────── second (0 - 59)
		 *
		 * * * * * * * - every second
		 * 0 * * * * * - every minute
		 * 0 0 * * * * - every hour
		 * 0 0 0 * * * - every day
		 * 0 0 0 * * 1 - every monday
		 * 0 1-2 * * * - every first and second minutes of hour
		 * 0 0 1,2 * * - every first and second hours of day
		 * 0 0 0-12/2 * * - every second hour of day first half
		 *
		 * also you can use synonyms:
		 * * @yearly   - 0 0 0 1 1 *
		 * * @annually - 0 0 0 1 1 *
		 * * @monthly  - 0 0 0 1 * *
		 * * @weekly   - 0 0 0 * * 0
		 * * @daily    - 0 0 0 * * *
		 * * @hourly   - 0 0 * * * *

		 *
		 * @name pattern
		 */
		this._pattern = synonyms(pattern);

		const sections = this._pattern.split(' ');
		if (sections.length !== 6) {
			throw new Error(`${ERROR_INPUT_MUST_HAVE_6_SECTIONS}: ${pattern}`);
		}

		this._sections = sections.map((item, index) => new Sections(item, index));

		this.rewind();
	}

	/**
	 * Start value for searching matches to {@link pattern} values
	 * @example
	 * import CronTime from 'cron-time';
	 * let i = new CronTime('0-1,4 0 0 * * *');
	 * i.start = '1970-01-01 00:00:00.000Z+0';
	 */
	get start() {
		return this._start;
	}

	set start(value) {
		this._start = new Date(value);
	}

	/**
	 * Final value for searching matches to {@link pattern} values
	 * @example
	 * import CronTime from 'cron-time';
	 * let i = new CronTime('0-1,4 0 0 * * *');
	 * i.end = '1970-12-31 00:00:00.000Z+0';
	 */
	get end() {
		return this._end;
	}

	set end(value) {
		this._end = new Date(value);
	}

	/**
	 * Rewinds current matching position to {@link start}
	 * @example
	 * import CronTime from 'cron-time';
	 * let i = new CronTime('0-1,4 0 0 * * *');
	 * i.start = '1970-01-01 00:00:00.000Z+0';
	 * i.next(); // '1970-01-01 00:00:00.000Z+0';
	 * i.next(); // '1970-01-01 00:00:01.000Z+0';
	 * i.rewind();
	 * i.next(); // '1970-01-01 00:00:00.000Z+0';
	 */
	rewind() {
		this._position = this.start ? this.start : new Date(0);
		delete this._nextIterable;
		this._sections.forEach(item => item.rewind());
	}

	/**
	 * @return {Date|undefined} - current matching to {@link pattern} time
	 * @example
	 * import CronTime from 'cron-time';
	 * let i = new CronTime('0-1,4 0 0 * * *');
	 * i.start = '1970-01-01 00:00:00.000Z+0';
	 * i.next();
	 * i.next();
	 * i.position; // '1970-01-01 00:00:01.000Z+0';
	 */
	get position() {
		return this._position;
	}

	* _next() {
		const iterable = this._nextIterable ? this._nextIterable : this._nextIterable = this[Symbol.iterator]();
		yield* iterable;
		delete this._nextIterable;
	}

	/**
	 * @return {Date|undefined} - next matching  to the {@link pattern} value
	 */
	next() {
		return this._next().next().value;
	}

	/**
	 * @param {Number} [size] - size of data portion
	 * @return {Array.Date} - next values that match to the {@link pattern}
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
	 * @return {String} - string representation of cron period {@link pattern}
	 */
	toString() {
		return this._pattern;
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

	/**
	 npm install --save crontime
	 @name Installation
	 */
}
