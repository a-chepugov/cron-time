const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

const {name, version} = require('./package.json');

const paths = {
	source: './source/**/!(*test).js',
	tests: './source/**/*test.js',
	build: 'build',
	clear: ['./build', 'doc'],
	doc: 'doc'
};

gulp.task('clean', () => {
	const del = require('del');
	return del([...paths.clear, paths.doc]);
});

gulp.task('build', function () {
	return gulp.src(paths.source)
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.build));
});

gulp.task('test:copy', function () {
	return gulp.src(paths.tests)
		.pipe(gulp.dest(paths.build))
	;
});

gulp.task('test-build', function () {
	const run = require('gulp-run');
	return gulp.src('./package.json')
		.pipe(run('mocha ./build/**/*test.js'));
});

gulp.task('dev-waterfall', () => {
	const watcher = gulp.watch(paths.source, gulp.series('clean', 'build', 'test:copy', 'test-build'));
	watcher.on('change', function (path) {
		console.log(`File${path} was changed`);
	});
	return watcher;
});

gulp.task('docs:md', function () {
	const gulpDocumentation = require('gulp-documentation');
	return gulp.src(paths.source)
		.pipe(gulpDocumentation('md', {}, {name, version}))
		.pipe(gulp.dest(paths.doc));
});

gulp.task('docs:html', function () {
	const gulpDocumentation = require('gulp-documentation');
	return gulp.src(paths.source)
		.pipe(gulpDocumentation('html', {}, {name, version}))
		.pipe(gulp.dest(paths.doc));
});

gulp.task('docs:watch', () => {
	const watcher = gulp.watch(paths.source, gulp.series('docs:html'));
	watcher.on('change', function (path) {
		console.log(`File${path} was changed`);
	});
	return watcher;
});

gulp.task('default', gulp.series('clean', 'build'));
