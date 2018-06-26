require('babel-core/register');
require('babel-polyfill');

const expect = require('chai').expect;

const Class = require('./index').default;
const {
	ERROR_INPUT_MUST_HAVE_6_SECTIONS,
	ERROR_INPUT_MUST_BE_A_STRING
} = require('./index');

describe('*', function () {

	it('last year second if it is monday', async function () {
		let i = new Class('59 59 23 31 12 *');
		i.start = '1970-12-31 00:00:00.000Z+0';
		i.end = '2000-12-31 23:59:59.000Z+0';
		const values = Array.from(i);
		expect(values.length).to.equal(31);
	});

	it('@annually', async function () {
		let i = new Class('@annually');
		i.start = '1970-01-01 0:0:0.000Z+0';
		i.end = '1979-12-31 23:59:59.000Z+0';
		const values = Array.from(i);
		expect(values.length).to.equal(10);
	});
	it('@yearly', async function () {
		let i = new Class('@yearly');
		i.start = '1970-01-01 0:0:0.000Z+0';
		i.end = '1979-12-31 23:59:59.000Z+0';
		const values = Array.from(i);
		expect(values.length).to.equal(10);
	});

	it('@monthly', async function () {
		let i = new Class('@monthly');
		i.start = '1970-01-01 0:0:0.000Z+0';
		i.end = '1970-12-31 23:59:59.000Z+0';
		const values = Array.from(i);
		expect(values.length).to.equal(12);
	});

	it('@weekly', async function () {
		let i = new Class('@weekly');
		i.start = '1970-01-01 0:0:0.000Z+0';
		i.end = '1970-12-31 23:59:59.000Z+0';
		const values = Array.from(i);
		expect(values.length).to.equal(52);
	});

	it('@daily', async function () {
		let i = new Class('@daily');
		i.start = '1970-01-01 0:0:0.000Z+0';
		i.end = '1970-12-31 23:59:59.000Z+0';
		const values = Array.from(i);
		expect(values.length).to.equal(365);
	});

	it('@hourly', async function () {
		let i = new Class('@hourly');
		i.start = '1970-01-01 0:0:0.000Z+0';
		i.end = '1970-12-31 23:59:59.000Z+0';
		const values = Array.from(i);
		expect(values.length).to.equal(8760);
	});

	it('every second during a day', async function () {
		let i = new Class('* * * 1 1 *');
		i.end = '1970-01-01 23:59:59.000Z+0';
		const values = Array.from(i);
		expect(values.length).to.equal(86400);
	});

	it('mixed', async function () {
		let i = new Class('1-5 16-18/2 20,23 1 1 *');
		i.end = '1970-01-01 23:59:59.000Z+0';
		const values = Array.from(i);
		expect(values.length).to.equal(20);
	});

	it('get next value', async function () {
		let i = new Class('0-1,3 0 0 * * *');
		i.end = '1970-01-01 23:59:59.000Z+0';
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:00.000Z'));
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:01.000Z'));
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:03.000Z'));
	});

	it('rewind', async function () {
		let i = new Class('0-1,3 0 0 * * *');
		i.end = '1970-01-01 23:59:59.000Z+0';
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:00.000Z'));
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:01.000Z'));
		i.rewind();
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:00.000Z'));
	});

	it('set position', async function () {
		let i = new Class('0-1,4 0 0 * * *');
		i.start = '1970-01-01 00:00:00.000Z+0';
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:00.000Z'));
		expect(i.position).to.deep.equal(new Date('1970-01-01T00:00:00.000Z'));
		expect(i.next()).to.deep.equal(new Date('1970-01-01T00:00:01.000Z'));
		expect(i.position).to.deep.equal(new Date('1970-01-01T00:00:01.000Z'));
	});

	it('get next values', async function () {
		let i = new Class('0-4 0 0 * * *', {
			start: '2000-01-01 00:00:00.000Z+0',
			end: '2000-01-01 23:59:59.000Z+0'
		});

		const p1 = i.nextPortion(1);
		const p2 = i.nextPortion(2);
		const p3 = i.nextPortion(3);

		expect(p1).to.deep.equal([
			new Date('2000-01-01T00:00:00.000Z')
		]);
		expect(p2).to.deep.equal([
			new Date('2000-01-01T00:00:01.000Z'),
			new Date('2000-01-01T00:00:02.000Z')
		]);
		expect(p3).to.deep.equal([
			new Date('2000-01-01T00:00:03.000Z'),
			new Date('2000-01-01T00:00:04.000Z')
		]);
	});

	it('toString', async function () {
		let i = new Class('59 59 23 31 12 *');
		expect(`${i}`).to.equal('59 59 23 31 12 *');
	});

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

});
