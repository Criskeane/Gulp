var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var runSequence = require('run-sequence');
var inject = require('gulp-inject');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var minifyJS = require('gulp-minify');
var notify = require("gulp-notify");
var cleanCSS = require('gulp-clean-css');

gulp.task('images', function(){
    return gulp.src('../app/images/**/*.+(png|jpg|gif|sgv)')
    .pipe(cache(imagemin({
        interlaced: true
    })))
    .pipe(gulp.dest('../dist/images'))
})

gulp.task('sass', function() {
    return gulp.src('../app/scss/**/*.scss')
    .pipe(sass({outputStyle: 'expand'}).on('error', notify.onError()))
    //.pipe(sass().on('error', sass.logError)) // Converts Sass to CSS with gulp-sass
    .pipe(cleanCSS())
    .pipe(gulp.dest('../dist/css'))
    .pipe(browserSync.reload({
        stream: true
    }));
});

gulp.task('useref', function(){
    return gulp.src('../app/css/*.css')
    .pipe(useref())
    //.pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('../dist/css'))
})

// gulp.task('inject', function(){
//     var target = gulp.src('../app/index.html');
//     var sources = gulp.src(['../app/scss/*.scss', '../app/scripts/*.js'], {read:false});
//     return target.pipe(inject(sources))
//     .pipe(gulp.dest('../dist/**/*.html'));
// })

// gulp.task('concat', function () {
//     return gulp.src('../app/scripts/*.js')
//     .pipe(minifyJS())
//     .pipe(concat('scripts.js'))
//     //.pipe(uglify())
//     .pipe(gulp.dest('../dist/scripts/'))
//     .pipe(browserSync.reload({
//         stream: true
//     }));
// })

// gulp.task('inject', function(){
//     return gulp.src('../app/scripts/*.js')
//     .pipe(concat('all.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest('../dist/js'))
// });

gulp.task('clean', function(){
    return del.sync('dist');
})

gulp.task('build', function(callback){
    runSequence('clean', ['sass', 'useref', 'images'], callback);
})

gulp.task('watch', ['browserSync', 'sass'], function (){
    
})

gulp.task('default', ['watch', 'browserSync', 'sass'],function(callback){
    gulp.watch('../app/scss/**/*.scss', ['sass']);
    gulp.watch('../app/*.html', browserSync.reload);
    gulp.watch('../app/js/*.js', browserSync.reload);
})

gulp.task('browserSync', function(){
    browserSync.init({
        server: {
            baseDir: '../dist'
        },
        notify: false,
    })
})