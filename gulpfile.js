'use strict';
var gulp = require('gulp'),
    bourbon = require('bourbon').includePaths,
    neat = require('bourbon-neat').includePaths,
    newer = require('gulp-newer'),
    imagemin = require('gulp-imagemin'),
    htmlclean = require('gulp-htmlclean'),
    concat = require('gulp-concat'),
    deponder = require('gulp-deporder'),
    stripdebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    scsslint = require('gulp-scss-lint'),
    postcss = require("gulp-postcss"),
    assets = require("postcss-assets"),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    cssnano = require('gulp-cssnano'),
    cache = require('gulp-cache'),
    browserSync = require('browser-sync'),
    del = require('del'),
    sourcemap = require('gulp-sourcemaps'),
    changed = require('gulp-changed'),

    //development mode?
    devBuild = (process.env.NODE_ENV !== 'production'),
    
    //folders
    folder = {
        src: './app/',
        build: 'build/'
    };

//export const clean = () => del(['build']);
gulp.task('clean', function(){
    return del(['build'])
});

//COPY FILE 
gulp.task('copy', function(){
    var pathjs = folder.src + '/js/jquery.min.js';
    var pathfont = folder.src + 'fonts/**/*';
    var dest = 'build';

    return gulp.src([pathjs, pathfont])
    .pipe(changed(dest))
    .pipe(gulp.dest(dest + '/js'));
});

//SPIN UP A SERVER
gulp.task('browserSync', function(){
    browserSync({
        server:{
            baseDir: 'build'
        }
    })
});

//IMAGES processing
gulp.task('imagemin', function(){
    var path = folder.build;
    return gulp.src(folder.src + '**/images/**/*.{jpg,jpeg,gif,svg,png}')
    .pipe(newer(path))
    .pipe(cache(imagemin({ 
        optimizationLevel: 5,
        interlaced: true
    })))
    .pipe(gulp.dest(path));
});

//HTML procesing
gulp.task('html', ['imagemin'], function(){
    var path = folder.build,
        page = gulp.src( folder.src + '**/**/*.html')
        //.pipe(htmlclean())
        .pipe(newer(path));

    if (!devBuild){
        page = page.pipe(htmlclean());
    }

    return page.pipe(gulp.dest(path));
});

// JavaScript processing
gulp.task('js', function(){
    var jsbuild = gulp.src(
        folder.src + ['js/**/!(jquery.min)*.js']
    )
    .pipe(deponder())
    //.pipe(uglify())
    .pipe(concat('main.js'));

    if(!devBuild){
        jsbuild = jsbuild.pipe(stripdebug()).pipe(uglify());
    }

    return jsbuild.pipe(gulp.dest(folder.build + 'js/'));
});

// SCSS processing
gulp.task('scss', ['imagemin'], function(){
    var postCSSopt = [
        assets({ loadPaths: ['images/'] }),
        autoprefixer ({ browsers: ['last 3 versions', "safari 5", "ie 8", "ie 9", '> 2%'] }),
        mqpacker
    ];

    if(!devBuild){
        postCSSopt.push(cssnano);
    }

    return gulp.src(folder.src + 'scss/**/*.scss')
    .pipe(sass({
        includePaths: require('node-normalize-scss').includePaths,
        errLogToConsole: true,
        outputStyle: 'compact', 
        //outputStyle: 'compressed',
        imagePaths: 'images/',
        precision: 3,
        errLogToConsole: true
    }))
    //.pipe(cssnano())
    .pipe(postcss(postCSSopt))
    .pipe(gulp.dest(folder.build + 'css/'))
    .pipe(browserSync.reload({
        stream: true
    }))
});

gulp.task('run', ['clean', 'html', 'scss', 'js', 'copy']);

gulp.task('watch',['browserSync', 'html', 'scss'], function(){
    //image changes
    gulp.watch(folder.src + '**/images/**/*.{jpg,jpeg,gif,svg,png}', ['imagemin']);

    //html changes
    gulp.watch(folder.src + '**/**/*.html', ['html']).on('change', browserSync.reload);

    //js changes
    gulp.watch(folder.src + '**/**/*.js', ['js']);

    //scss changes
    gulp.watch(folder.src + '**/**/*.scss', ['scss']);
});

gulp.task('default', ['run', 'watch']);