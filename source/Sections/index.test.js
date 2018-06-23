require('babel-core/register');
require('babel-polyfill');

const expect = require('chai').expect;

const Class = require('./index').default;

describe('Section', function () {

	it('1', async function () {
		let i = new Class('1', 1);
		const values = Array.from(i);
		expect(values.length).to.equal(1);
		expect(i.has(1)).to.equal(true);
		expect(i.has(9)).to.equal(false);
	});

	it('1-5', async function () {
		let i = new Class('1-5', 2);
		const values = Array.from(i);
		expect(values.length).to.equal(5);
		expect(i.has(5)).to.equal(true);
		expect(i.has(6)).to.equal(false);
	});

	it('1,2,4-6', async function () {
		let i = new Class('1,2,4-6', 3);
		const values = Array.from(i);
		expect(values.length).to.equal(5);
		expect(i.has(2)).to.equal(true);
		expect(i.has(3)).to.equal(false);
	});

	it('0-8/2,6. month', async function () {
		let i = new Class('0-8/2,6', 4);
		const values = Array.from(i);
		expect(values.length).to.equal(5);
		expect(i.has(5)).to.equal(true);
		expect(i.has(6)).to.equal(false);
	});

	it('1-12. month', async function () {
		let i = new Class('1-12', 4);
		const values = Array.from(i);
		expect(values.length).to.equal(12);
		expect(i.has(0)).to.equal(true);
		expect(i.has(12)).to.equal(false);
	});

	it('1-7. week', async function () {
		let i = new Class('1-7', 5);
		const values = Array.from(i);
		expect(values.length).to.equal(7);
		expect(i.has(0)).to.equal(true);
		expect(i.has(7)).to.equal(false);
	});
});
