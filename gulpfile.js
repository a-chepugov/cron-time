const gulp = require('gulp');
const {name, version} = require('./package.json');

const paths = {
	source: './source/**/!(*test).js',
	tests: './source/**/*test.js',
	clear: ['doc'],
	doc: 'doc'
};

gulp.task('clean', () => {
	const del = require('del');
	return del([...paths.clear]);
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
		console.info(`File${path} was changed`);
	});
	return watcher;
});
