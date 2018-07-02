const DateTz = require('date-tz');

const Sections = require('./Sections');
const synonyms = require('./helpers/synonyms');

const ERROR_INPUT_MUST_BE_A_STRING = 'Input must be a string';
const ERROR_INPUT_MUST_HAVE_6_SECTIONS = 'Input must have 6 sections separated by spaces';
const MUST_BE_CONVERTIBLE = 'Value must be convertible into a Date';

module.exports = class {
	/**
	 * Parse cron time string
	 * @constructor CronTime
	 * @param {string} pattern - {@link pattern}
	 * @param {object} [options] - initial options
	 * @param {date|number|string} [options.start] - {@link start}
	 * @param {date|number|string} [options.end] - {@link end}
	 * @param {string} [options.zone='+00'] - {@link zone}
	 * @example
	 * import CronTime from 'cron-time';
	 * let i = new CronTime('0-1,4 0 0 * * *', {
	 * 	start: '1970-01-01 00:00:00.0=John Doe00Z',
	 * 	end: '1970-01-01 23:59:59.000Z'
	 * });
	 *
	 * const next = i.next()
	 * // 1970-01-01T00:00:00.000Z;
	 *
	 * const portion = i.nextPortion(2);
	 * // [ '1970-01-01T00:00:01.000Z', '1970-01-01T00:00:04.000Z'] ;
	 */
	constructor(pattern, options = {}) {
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
		this.__pattern = synonyms(pattern);

		const sections = this.__pattern.split(' ');
		if (sections.length !== 6) {
			throw new Error(`${ERROR_INPUT_MUST_HAVE_6_SECTIONS}. Got: ${pattern}`);
		}

		this.__sections = sections.map((item, index) => new Sections(item, index));

		if (options.start !== undefined) {
			this.start = options.start;
		}

		if (options.end !== undefined) {
			this.end = options.end;
		}

		this.zone = options.zone;

		this.rewind();
	}

	__getDate(value) {
		const date = new Date(value);
		if (date.toString() === 'Invalid Date') {
			throw new Error(`${MUST_BE_CONVERTIBLE}. Got: ${value}`);
		} else {
			return date;
		}
	}

	/**
	 * @param {string} value - zone in {@link https://rfc2.ru/5322.rfc/print#p3.3 rfc2822} format
	 */
	set zone(value) {
		this.__zone = value;
	}

	get zone() {
		return this.__zone;
	}

	/**
	 * Start value for searching matches to {@link pattern} values
	 * @param {date|number|string} value - any convertible to {@link Date) value
	 * @example
	 * import CronTime from 'cron-time';
	 * let i = new CronTime('0-1,4 0 0 * * *');
	 * i.start = '1970-01-01 00:00:00.000Z';
	 * console.log(i.start); // '1970-01-01 00:00:00.000Z';
	 * i.rewind();
	 */
	set start(value) {
		this.__start = this.__getDate(value);
	}

	get start() {
		return this.__start;
	}

	/**
	 * Final value for searching matches to {@link pattern} values
	 * @param {date|number|string} value - any convertible to {@link Date) value
	 * @example
	 * import CronTime from 'cron-time';
	 * let i = new CronTime('0-1,4 0 0 * * *');
	 * i.end = '1970-12-31 00:00:00.000Z';
	 * console.log(i.end); // '1970-12-31 00:00:00.000Z';
	 * i.rewind();
	 */
	set end(value) {
		this.__end = this.__getDate(value);
	}

	get end() {
		return this.__end;
	}

	/**
	 * Rewinds current matching position to {@link start}
	 * @example
	 * import CronTime from 'cron-time';
	 * let i = new CronTime('0-1,4 0 0 * * *');
	 * i.start = '1970-01-01 00:00:00.000Z';
	 * i.rewind();
	 * i.next(); // '1970-01-01 00:00:00.000Z';
	 * i.next(); // '1970-01-01 00:00:01.000Z';
	 * i.rewind();
	 * i.next(); // '1970-01-01 00:00:00.000Z';
	 */
	rewind() {
		this.__position = this.start ? new DateTz(this.zone, this.start) : new DateTz(this.zone, new Date(0));
		delete this.__nextIterable;
		this.__sections.forEach(item => item.rewind());
	}

	/**
	 * @return {date|undefined} - current matching to {@link pattern} time
	 * @example
	 * import CronTime from 'cron-time';
	 * let i = new CronTime('0-1,4 0 0 * * *');
	 * i.start = '1970-01-01 00:00:00.000Z';
	 * i.rewind();
	 * i.next();
	 * i.next();
	 * i.position; // '1970-01-01 00:00:01.000Z';
	 */
	get position() {
		return this.__position;
	}

	* __next() {
		const iterable = this.__nextIterable ? this.__nextIterable : this.__nextIterable = this[Symbol.iterator]();
		yield* iterable;
		delete this.__nextIterable;
	}

	/**
	 * @return {Date|undefined} - next matching  to the {@link pattern} value in {@link start}-{@link end} range
	 */
	next() {
		return this.__next().next().value;
	}

	/**
	 * @param {number} [size] - size of data portion
	 * @return {number} - values amount that match to the {@link pattern} in {@link start}-{@link end} range
	 */
	countPortion(size = 1) {
		let result = 0;
		while (result < size && this.next()) {
			result++;
		}
		return result;
	}

	/**
	 * @param {number} [size] - size of data portion
	 * @return {Array.date} - next values that match to the {@link pattern} in {@link start}-{@link end} range
	 */
	nextPortion(size = 1) {
		const result = [];
		let next;
		while (result.length < size && (next = this.next())) {
			result.push(next);
		}
		return result;
	}

	/**
	 * @return {string} - string representation of cron period {@link pattern}
	 */
	toString() {
		return this.__pattern;
	}

	* [Symbol.iterator]() {
		const [S, M, H, d, m, a] = this.__sections;
		const end = this.end;
		while (this.__position <= end || !end) {
			if (
				// Match to day of week or day of month
				m.has(this.__position.getTzMonth()) && d.has(this.__position.getTzDate()) && a.has(this.__position.getTzDay())
			) {
				const positionNew = new DateTz(this.zone, this.__position);
				// Iterate hours, minutes & seconds
				for (const hour of H) {
					positionNew.setTzHours(hour);
					for (const min of M) {
						positionNew.setTzMinutes(min);
						for (const sec of S) {
							positionNew.setTzSeconds(sec);
							if (positionNew >= this.__position) {
								this.__position = positionNew;
								yield new Date(positionNew);
							}
						}
						S.rewind();
					}
					M.rewind();
				}
				H.rewind();
			}

			// Go to the next day
			this.__position.setTzDate(this.__position.getUTCDate() + 1);
			this.__position.setTzHours(0, 0, 0, 0);
		}
	}

	/**
	 npm install --save crontime
	 @name Installation
	 */
};

module.exports.ERROR_INPUT_MUST_BE_A_STRING = ERROR_INPUT_MUST_BE_A_STRING;
module.exports.ERROR_INPUT_MUST_HAVE_6_SECTIONS = ERROR_INPUT_MUST_HAVE_6_SECTIONS;
module.exports.MUST_BE_CONVERTIBLE = MUST_BE_CONVERTIBLE;
