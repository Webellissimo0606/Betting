const del = require('del');
const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const liveServer = require('gulp-live-server');
const plumber = require('gulp-plumber');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const sourcemaps = require('gulp-sourcemaps');
const sysBuilder = require('systemjs-builder');
const tslint = require('gulp-tslint');
const tsc = require('gulp-typescript');
const uglify = require('gulp-uglify');
const tsconfig = require('tsconfig-glob');

const tscConfig = require('./tsconfig.json');

// Clean the js distribution directory
gulp.task('clean:dist:js', function () {
  return del('dist/js/*');
});

// Clean the css distribution directory
gulp.task('clean:dist:css', function () {
  return del('dist/css/*');
});

// Clean library directory
gulp.task('clean:lib', function () {
  return del('dist/lib/**/*');
});

// Lint Typescript
gulp.task('lint:ts', function() {
  return gulp.src('app/**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report('verbose', { emitError: false }));
});

// Compile TypeScript to JS
gulp.task('compile:ts', function () {
  return gulp
    .src(tscConfig.filesGlob)
    .pipe(plumber({
      errorHandler: function (err) {
        console.error('>>> [tsc] Typescript compilation failed'.bold.green);
        this.emit('end');
      }}))
    .pipe(sourcemaps.init())
    .pipe(tsc(tscConfig.compilerOptions))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

// Generate systemjs-based builds
gulp.task('bundle:js', function() {
  var builder = new sysBuilder('./', './systemjs.config.js');
  return builder.buildStatic('app', 'dist/js/bundle.min.js')
    .then(function () {
      return del(['dist/js/**/*', '!dist/js/bundle.min.js']);
    })
    .catch(function(err) {
      console.error('>>> [systemjs-builder] Bundling failed'.bold.green, err);
    });
});

// Minify JS bundle
gulp.task('minify:js', function() {
  return gulp
    .src('dist/js/bundle.min.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});


// Concat and minify CSS
gulp.task('minify:css', function() {
  // concat and minify application speific css files
  return gulp
    .src([
      'node_modules/angular2-busy/build/style/busy.css',
      'app/**/*.css'
    ])
    .pipe(concat('app.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'));
});


// Generate systemjs-based builds
//gulp.task('bundle:js', function() {
//  var builder = new sysBuilder('./', './systemjs.config.js');
//  return builder.bundle('app/**/*.js', 'dist/js/bundle.min.js', { minify: true, sourceMaps: true,  runtime: false });
//});


// Bundle dependant libraries (both script and styles)
gulp.task('copy:libs', function() {

  // concatenate non-angular2 libs, shims & systemjs-config
  gulp.src([
    'node_modules/core-js/client/shim.min.js',
    'node_modules/zone.js/dist/zone.js',
    'node_modules/reflect-metadata/Reflect.js',
    'node_modules/systemjs/dist/system.src.js',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'systemjs.config.js'
  ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/lib'));

  // concatenate css library files related to bootstrap 
  gulp.src([
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
    'node_modules/bootstrap/dist/css/bootstrap-theme.min.css'
  ])
    .pipe(concat('styles.min.css'))
    .pipe(gulp.dest('dist/lib'));

});

// Bundle utility libraries
gulp.task('copy:libsutil', function() {

  // concatenate utility libraries
  gulp.src([
    'node_modules/moment/min/moment.min.js',
    'node_modules/moment-timezone/builds/moment-timezone.min.js',
    'node_modules/moment-timezone/builds/moment-timezone-with-data-2012-2022.min.js'
  ])
  .pipe(concat('libsutil.min.js'))
  .pipe(gulp.dest('dist/lib'));

});


// Update the tsconfig files based on the glob pattern
gulp.task('tsconfig-glob', function () {
  return tsconfig({
    configPath: '.',
    indent: 2
  });
});

// Watch src files for changes, then trigger recompilation
gulp.task('watch:src', function() {
  gulp.watch('app/**/*.ts', ['scripts']);
  gulp.watch('app/**/*.css', ['styles']);
});

gulp.task('lint', ['lint:ts']);

gulp.task('clean', ['clean:dist:js', 'clean:dist:css', 'clean:lib']);

gulp.task('copy', function(callback) {
  runSequence('clean:lib', 'copy:libs', 'copy:libsutil', callback);
});

gulp.task('scripts', function(callback) {
  runSequence(['clean:dist:js'], 'compile:ts', 'bundle:js', 'minify:js', callback);
});

gulp.task('styles', function(callback) {
  runSequence(['clean:dist:css'], ['minify:css'], callback);
});
gulp.task('build', function(callback) {
  runSequence('copy', 'scripts', 'styles', callback);
});

gulp.task('default', function(callback) {
  runSequence('build', callback);
});