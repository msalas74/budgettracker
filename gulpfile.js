var gulp = require('gulp')
var gutil = require('gulp-util')
var bower = require('bower')
var concat = require('gulp-concat')
var sass = require('gulp-sass')
var minifyCss = require('gulp-minify-css')
var rename = require('gulp-rename')
var sh = require('shelljs')

var paths = {
  sass: ['./scss/**/*.scss']
}

gulp.task('default', ['sass'])

gulp.task('sass', function (done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done)
})

gulp.task('watch', function () {
  gulp.watch(paths.sass, ['sass'])
  gulp.watch(jsFiles, ['js'])
})

gulp.task('install', ['git-check'], function () {
  return bower.commands.install()
    .on('log', function (data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message)
    })
})

gulp.task('git-check', function (done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    )
    process.exit(1)
  }
  done()
})

var jsFiles = [
  'www/js/dev/myapp.js',
  'www/js/dev/services/loader.services.js',
  'www/js/dev/services/authentication.services.js',
  'www/js/dev/services/budgettracker.services.js',
  'www/js/dev/services/category.services.js',
  'www/js/dev/controllers/users.controller.js',
  'www/js/dev/controllers/app.controller.js',
  'www/js/dev/controllers/category.controller.js'
]

gulp.task('js', function () {
  return gulp.src(jsFiles)
    .pipe(concat('app.js'))
    .pipe(gulp.dest('www/js'))
})
