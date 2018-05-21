'use strict';
var gulp = require('gulp'),
    bourbon = require('bourbon').includePaths,
    neat = require('bourbon-neat').includePaths,
    deponder = require('gulp-deporder'),
    assets = require("postcss-assets"),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    browserSync = require('browser-sync'),
    del = require('del'),
    runSequence = require('run-sequence'),
    bowerFile = require('main-bower-files'),
    es = require('event-stream'),

    //development mode?
    devBuild = (process.env.NODE_ENV !== 'production'),
    
    //folders
    folder = {
        src: './app/',
        build: 'build/'
    };

var plugins = require('gulp-load-plugins')();

//CLEAN BUILD
gulp.task('clean', function(){
    return del(['build'])
});

//INJECT FILE BUILD
gulp.task('inject', function(){
    var source = gulp.src([
        folder.build + '**/*.css', folder.build + '**/*.js'
    ])

    gulp.src(folder.build + '**/*.html')
    .pipe(plugins.inject(
        source, {ignorePath: 'build', addRootSlash: false }
    ))
    .pipe(gulp.dest('./build'));
});

//INJECT FILE DEV
gulp.task('inject:dev', function(){
    var source = gulp.src([
        folder.build + '**/*.css', folder.build + '**/*.js'
    ])

    gulp.src(folder.build + '**/*.html')
    .pipe(plugins.inject(
        source, {ignorePath: 'app', addRootSlash: false }
    ))
    .pipe(gulp.dest('./app'));
});

//COPY FILE FONT
gulp.task('copyfont', function(){
    var pathfont = folder.src + 'fonts/**/*';
    var dests = 'build';

    return gulp.src(pathfont)
    .pipe(plugins.changed(dests))
    .pipe(gulp.dest(dests + '/font'));
});

//SPIN UP A SERVER
gulp.task('serve', function(){
    browserSync.init({
        // proxy: "http://localhost:3000/",
        // server:{
        //     baseDir: 'build',
        //     temp: 'tmp'
        //     //directory: true
        // }
        server: { baseDir: 'build' },
        proxy: null,
        files: [ 'build' ],
        reloadDelay: 50
    });
    //gulp.watch('app/**/*.*').on('change', browserSync.reload);
});

//IMAGES processing
gulp.task('imagemin', function(){
    var path = folder.build;
    return gulp.src(folder.src + '**/images/**/*.{jpg,jpeg,gif,svg,png}')
    .pipe(plugins.newer(path))
    .pipe(plugins.cache(plugins.imagemin({ 
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
        .pipe(plugins.newer(path));

    if (!devBuild){
        page = page.pipe(plugins.htmlclean());
    }

    return page.pipe(gulp.dest(path));
});

// JavaScript processing
gulp.task('js', function(){
    var pathjs = folder.src + '/js/jquery.min.js';
    var dests = 'build';

    gulp.src(pathjs)
        .pipe(plugins.changed(dests))
        .pipe(gulp.dest(dests + '/js'));

    var jsbuild = gulp.src(
        folder.src + ['js/**/!(jquery.min)*.js']
    )
    .pipe(deponder())
    //.pipe(uglify())
    .pipe(plugins.concat('main.js'));

    if(!devBuild){
        jsbuild = jsbuild.pipe(plugins.stripdebug()).pipe(plugins.uglify());
    }

    return jsbuild.pipe(gulp.dest(folder.build + 'js/'));
});

// SCSS processing
gulp.task('scss', ['imagemin'], function(){
    var csssrc = [folder.src + 'scss/**/*.scss']
    var postCSSopt = [
        assets({ loadPaths: ['images/'] }),
        autoprefixer ({ browsers: ['last 3 versions', "safari 5", "ie 8", "ie 9", '> 2%'] }),
        mqpacker
    ];

    if(!devBuild){
        postCSSopt.push(cssnano());
    }

    return gulp.src([folder.src + 'scss/**/*.scss', '!**/_*.scss'])
    .pipe(plugins.sass({
        outputStyle: 'compact', 
        precision: 3
        //outputStyle: 'compressed',
    }))
    //.pipe(plugins.cssnano())
    .pipe(plugins.plumber({
        errorHandler : function (error){
            console.log(error.toSring());
            this.emit('end');
        }
    }))
    .pipe(plugins.postcss(postCSSopt))
    //.pipe(concat('style.min.css'))
    .pipe(gulp.dest(folder.build + 'css/'))
    .pipe(browserSync.reload({
        stream: true
    }))
});

gulp.task('run', ['clean'], function(){
    runSequence('js', 'scss', 'html', 'copyfont', 'inject');
});

gulp.task('watch',['serve', 'html', 'scss'], function(){
    //image changes
    gulp.watch(folder.src + '**/images/**/*.{jpg,jpeg,gif,svg,png}', ['imagemin']);

    //html changes
    gulp.watch(folder.src + '**/**/*.html', ['html']).on('change', browserSync.reload);

    //js changes
    gulp.watch(folder.src + '**/**/*.js', ['js']);

    //scss changes
    gulp.watch(folder.src + '**/**/*.scss', ['scss']);
});

gulp.task('default', function(){
    runSequence('run', 'watch');
});