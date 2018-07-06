const expect = require('chai').expect;

const Class = require('./index');
const {
	ERROR_INPUT_MUST_HAVE_6_SECTIONS,
	ERROR_INPUT_MUST_BE_A_STRING,
	MUST_BE_CONVERTIBLE
} = require('./index');

describe('*', function () {

	it('last year second if it is monday', async function () {
		let i = new Class('59 59 23 31 12 *', {end: '2000-12-31 23:59:59.000Z'});
		const values = Array.from(i);
		expect(values.length).to.equal(31);
	});

	it('@annually', async function () {
		let i = new Class('@annually', {end: '1979-12-31 23:59:59.000Z'});
		const values = Array.from(i);
		expect(values.length).to.equal(10);
	});
	it('@yearly', async function () {
		let i = new Class('@yearly', {end: '1979-12-31 23:59:59.000Z'});
		const values = Array.from(i);
		expect(values.length).to.equal(10);
	});

	it('@monthly', async function () {
		let i = new Class('@monthly', {end: '1970-12-31 23:59:59.000Z'});
		const values = Array.from(i);
		expect(values.length).to.equal(12);
	});

	it('@weekly', async function () {
		let i = new Class('@weekly', {end: '1970-12-31 23:59:59.000Z'});
		const values = Array.from(i);
		expect(values.length).to.equal(52);
	});

	it('@daily', async function () {
		let i = new Class('@daily', {end: '1970-12-31 23:59:59.000Z'});
		const values = Array.from(i);
		expect(values.length).to.equal(365);
	});

	it('@hourly', async function () {
		let i = new Class('@hourly', {end: '1970-12-31 23:59:59.000Z'});
		const values = Array.from(i);
		expect(values.length).to.equal(8760);
	});

	it('hourly. start date is midday', async function () {
		let i = new Class('0 0 * * * *', {start: '2000-01-01 12:00:00.000Z', end: '2000-01-01 23:00:00.000Z'});
		const values = Array.from(i);
		expect(values.length).to.equal(12);
	});

	it('every second during a day', async function () {
		let i = new Class('* * * 1 1 *');
		i.end = '1970-01-01 23:59:59.000Z';
		const values = Array.from(i);
		expect(values.length).to.equal(86400);
	});

	it('mixed', async function () {
		let i = new Class('1-5 16-18/2 20,23 1 1 *', {end: '1970-12-31 23:59:59.000Z'});
		const values = Array.from(i);
		expect(values.length).to.equal(20);
	});

	it('get next value', async function () {
		let i = new Class('0-1,3 0 0 * * *', {end: '1970-01-01 23:59:59.000Z'});
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:00.000Z'));
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:01.000Z'));
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:03.000Z'));
	});

	it('rewind', async function () {
		let i = new Class('0-1,3 0 0 * * *', {end: '1970-12-31 23:59:59.000Z'});
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:00.000Z'));
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:01.000Z'));
		i.rewind();
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:00.000Z'));
	});

	it('get position', async function () {
		let i = new Class('0-1,4 0 0 * * *');
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:00.000Z'));
		expect(i.position).to.deep.equal(new Date('1970-01-01T00:00:00.000Z'));
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:01.000Z'));
		expect(i.position).to.deep.equal(new Date('1970-01-01T00:00:01.000Z'));
	});

	it('get next values', async function () {
		let i = new Class('0-4 0 0 * * *', {
			start: '2000-01-01 00:00:00.000Z',
			end: '2000-01-01 23:59:59.000Z'
		});

		expect(i.nextPortion(1)).to.deep.equal([
			new Date('2000-01-01T00:00:00.000Z')
		]);
		expect(i.nextPortion(2)).to.deep.equal([
			new Date('2000-01-01T00:00:01.000Z'),
			new Date('2000-01-01T00:00:02.000Z')
		]);
		expect(i.nextPortion(3)).to.deep.equal([
			new Date('2000-01-01T00:00:03.000Z'),
			new Date('2000-01-01T00:00:04.000Z')
		]);
	});

	it('get next values. shifted', async function () {
		let i = new Class('5-6 13-14 22 * * *', {
			start: '2000-01-01 23:00:00.000Z',
			end: '2000-01-02 23:59:59.000Z'
		});

		expect(i.nextPortion(1)).to.deep.equal([
			new Date('2000-01-02T22:13:05.000Z')
		]);
		expect(i.nextPortion(2)).to.deep.equal([
			new Date('2000-01-02T22:13:06.000Z'),
			new Date('2000-01-02T22:14:05.000Z')
		]);
		expect(i.nextPortion(3)).to.deep.equal([
			new Date('2000-01-02T22:14:06.000Z'),
		]);
	});

	it('get count portion', async function () {
		let i = new Class('0 0 * * * *', {
			start: '2000-01-01 00:00:00.000Z',
			end: '2001-01-01 23:59:59.000Z'
		});

		expect(i.countPortion(Number.MAX_SAFE_INTEGER)).to.deep.equal(8808);
	});

	it('get next values. zone', async function () {
		let i = new Class('0 0 5-6 * * *', {
			start: '2000-01-01 00:00:00.000Z',
			end: '2000-03-01 23:59:59.000Z',
			zone: '+01'
		});

		expect(i.next()).to.deep.equal(
			new Date('2000-01-01T04:00:00.000Z')
		);
	});

	it('get next values. zone negative', async function () {
		let i = new Class('0 0 5-6 * * *', {
			start: '2000-03-05 01:00:00.000Z',
			end: '2000-04-01 23:59:59.000Z',
			zone: '-0410'
		});

		expect(i.next()).to.deep.equal(
			new Date('2000-03-06T09:10:00.000Z')
		);
	});

	it('pattern', async function () {
		let i = new Class('0-1,4 0 0 * * *');
		expect(i.pattern).to.equal('0-1,4 0 0 * * *');
	});

	it('toString', async function () {
		let i = new Class('59 59 23 31 12 *', {zone: '+04'});
		expect(`${i}`).to.equal('59 59 23 31 12 * | +0400');
	});

});

describe('throw', function () {

	it(ERROR_INPUT_MUST_BE_A_STRING, async function () {
		expect(() => new Class(1)).to.throw(ERROR_INPUT_MUST_BE_A_STRING);
	});

	it(ERROR_INPUT_MUST_HAVE_6_SECTIONS, async function () {
		expect(() => new Class('* * * * *')).to.throw(ERROR_INPUT_MUST_HAVE_6_SECTIONS);
	});

	it(ERROR_INPUT_MUST_HAVE_6_SECTIONS, async function () {
		expect(() => new Class('*_*_*_*_*_*')).to.throw(ERROR_INPUT_MUST_HAVE_6_SECTIONS);
	});

	it(ERROR_INPUT_MUST_HAVE_6_SECTIONS, async function () {
		expect(() => new Class('* * * * * * *')).to.throw(ERROR_INPUT_MUST_HAVE_6_SECTIONS);
	});

	it(MUST_BE_CONVERTIBLE, async function () {
		expect(() => new Class('* * * * * *', {start: NaN})).to.throw(MUST_BE_CONVERTIBLE);
	});

});

describe.skip('benchmark', function () {

	it('nextPortion', function () {
		this.timeout(15000);

		const i = new Class('* * * * * *', {
			start: '2000-01-01 00:00:00.000Z',
			end: '2000-12-31 23:59:59.000Z'
		});

		console.time('nextPortion');
		i.nextPortion(5000000);
		console.timeEnd('nextPortion');
	});

	it('countPortion', function () {
		this.timeout(15000);

		const i = new Class('* * * * * *', {
			start: '2000-01-01 00:00:00.000Z',
			end: '2000-12-31 23:59:59.000Z'
		});

		console.time('countPortion');
		i.countPortion(5000000);
		console.timeEnd('countPortion');
	});

});
