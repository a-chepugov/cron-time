const expect = require('chai').expect;

const Class = require('./index');
const {
	ERROR_INPUT_MUST_BE_A_STRING,
	ERROR_INPUT_MUST_BE_A_NUMBER,
	ERROR_STRUCTURE,
	ERROR_OUT_OF_RANGE,
	ERROR_INVERSED_VALUES
} = require('./index');

describe('Point', function () {
	it('*', async function () {
		let i = new Class('*', 59);
		expect((Array.from(i)).length).to.equal(60);
	});
	it('*/2', async function () {
		let i = new Class('*/2', 59);
		expect((Array.from(i)).length).to.equal(30);
	});
	it('2-8', async function () {
		let i = new Class('2-8', 59);
		expect((Array.from(i)).length).to.equal(7);
	});
	it('1-5/2', async function () {
		let i = new Class('2-8/2', 59);
		expect((Array.from(i)).length).to.equal(4);
	});
	it('1/2. length', async function () {
		let i = new Class('1/2', 59);
		expect((Array.from(i)).length).to.equal(1);
	});
	it('11-50/2. length', async function () {
		let i = new Class('11-50/2', 59);
		expect((Array.from(i)).length).to.equal(20);
	});

	describe('throw', function () {
		it(ERROR_INPUT_MUST_BE_A_STRING, async function () {
			expect(() => new Class(NaN, 59)).to.throw(ERROR_INPUT_MUST_BE_A_STRING);
		});
		it(ERROR_INPUT_MUST_BE_A_NUMBER, async function () {
			expect(() => new Class('*', '1')).to.throw(ERROR_INPUT_MUST_BE_A_NUMBER);
		});
		it(ERROR_STRUCTURE, async function () {
			expect(() => new Class('', 59)).to.throw(ERROR_STRUCTURE);
		});
		it(ERROR_STRUCTURE, async function () {
			expect(() => new Class('1/1/1', 59)).to.throw(ERROR_STRUCTURE);
		});
		it(ERROR_STRUCTURE, async function () {
			expect(() => new Class('*-1', 59)).to.throw(ERROR_STRUCTURE);
		});
		it(ERROR_STRUCTURE, async function () {
			expect(() => new Class('1-Q', 59)).to.throw(ERROR_STRUCTURE);
		});
		it(ERROR_STRUCTURE, async function () {
			expect(() => new Class('1-2/Q', 59)).to.throw(ERROR_STRUCTURE);
		});
		it(ERROR_OUT_OF_RANGE, async function () {
			expect(() => new Class('1-70', 59)).to.throw(ERROR_OUT_OF_RANGE);
		});
		it(ERROR_OUT_OF_RANGE, async function () {
			expect(() => new Class('70', 59)).to.throw(ERROR_OUT_OF_RANGE);
		});
		it(ERROR_INVERSED_VALUES, async function () {
			expect(() => new Class('9-7', 59)).to.throw(ERROR_INVERSED_VALUES);
		});
		it(ERROR_INVERSED_VALUES, async function () {
			expect(() => new Class('9-7/2', 59)).to.throw(ERROR_INVERSED_VALUES);
		});
	});
});
