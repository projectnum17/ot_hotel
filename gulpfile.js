'use strict';

const { src, dest, watch, parallel, series } = require('gulp');
const gulpif = require('gulp-if');
const { argv } = require('yargs');

// Определяем режим: gulp --prod или gulp build --prod
const isProd = !!argv.prod;
const isDev = !isProd;

// Стили
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const gcmq = require('gulp-group-css-media-queries');
const sourcemaps = require('gulp-sourcemaps');

// HTML и инструменты
const panini = require('panini');
const strip = require('gulp-strip-comments');
const htmlbeautify = require('gulp-html-beautify');
const bemValidator = require('gulp-html-bem-validator');

// Шрифты
const fonter = require('gulp-fonter-unx');
const ttf2woff2 = require('gulp-ttf2woff2');

// Инструменты
const rename = require('gulp-rename');
const del = require('del');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const replace = require('gulp-replace');

// PATHS
const srcPath = 'src/';
const distPath = 'dist/';

const path = {
    build: {
        html: distPath,
        css: distPath + 'assets/css/',
        images: distPath + 'assets/images/',
        fonts: distPath + 'assets/fonts/',
        video: distPath + 'assets/video/',
        audio: distPath + 'assets/audio/',
    },
    src: {
        html: srcPath + '*.html',
        css: srcPath + 'assets/scss/*.scss',
        images: srcPath + 'assets/images/**/*.+(png|jpg|gif|ico|svg|webp)',
        fonts: srcPath + 'assets/fonts/**/*.{ttf,otf,woff,woff2,eot,svg}',
        video: srcPath + 'assets/video/**/*.+(mp4|webm|avi|mov|png|jpg)',
        audio: srcPath + 'assets/audio/**/*.+(mp3)',
    },
    watch: {
        html: srcPath + '**/*.html',
        css: srcPath + 'assets/scss/**/*.scss',
        images: srcPath + 'assets/images/**/*.+(png|jpg|gif|ico|svg|webp)',
        fonts: srcPath + 'assets/fonts/**/*',
        video: srcPath + 'assets/video/**/*.+(mp4|webm|avi|mov|png|jpg)',
        audio: srcPath + 'assets/audio/**/*.+(mp3)',
    },
    clean: './' + distPath,
};

// Обработка ошибок с динамическим заголовком
function plumberNotify(title) {
    return plumber({
        errorHandler(error) {
            console.log(`\n[${title || 'Gulp Error'}]`);
            console.log(error.message);
            this.emit('end');
        },
    });
}

// SERVER
function serve() {
    browserSync.init({
        server: { baseDir: './' + distPath },
        notify: false,
    });
}

// HTML
function html() {
    panini.refresh();
    // Добавлена защита, если вдруг временно нет *.html файлов в корне src
    return src(path.src.html, { base: srcPath, allowEmpty: true })
        .pipe(plumberNotify('HTML Error'))
        .pipe(
            panini({
                root: srcPath,
                layouts: srcPath + 'templates/layouts/',
                defaultLayout: false,
                partials: [
                    srcPath + 'templates/partials/',
                    srcPath + 'templates/components/',
                ],
                helpers: srcPath + 'templates/helpers/',
                data: srcPath + 'templates/data/',
            }),
        )
        .pipe(replace('@@suffix', isProd ? '.min' : ''))
        .pipe(bemValidator())
        .pipe(gulpif(isProd, strip()))
        .pipe(
            htmlbeautify({
                indent_size: 4,
                indent_char: ' ',
                unformatted: [],
                inline: [],
                indent_inner_html: true,
                max_preserve_newlines: 1,
                extra_liners: [],
            }),
        )
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({ stream: true }));
}

// STYLES
function css() {
    // Добавлена защита на случай отсутствия главного scss
    return src(path.src.css, { allowEmpty: true })
        .pipe(plumberNotify('CSS/SCSS Error'))
        .pipe(gulpif(isDev, sourcemaps.init()))
        .pipe(
            sass({
                outputStyle: 'expanded',
                includePaths: ['node_modules'],
            }),
        )
        .pipe(
            autoprefixer({
                cascade: true,
                grid: false,
            }),
        )
        .pipe(gulpif(isProd, gcmq()))
        .pipe(gulpif(isDev, sourcemaps.write('.')))
        .pipe(dest(path.build.css))
        .pipe(
            gulpif(
                isProd,
                cleancss({
                    level: { 1: { specialComments: 0 } },
                }),
            ),
        )
        .pipe(gulpif(isProd, rename({ suffix: '.min' })))
        .pipe(gulpif(isProd, dest(path.build.css)))
        .pipe(browserSync.reload({ stream: true }));
}

// LIBS
function libs() {
    // ВОТ ТУТ падала ошибка. Теперь если libs.js нет, gulp не упадет
    return src('src/assets/js/libs.js', { base: 'src/', allowEmpty: true })
        .pipe(dest(distPath))
        .pipe(browserSync.reload({ stream: true }));
}

// SCRIPTS (Копирование нативных модулей)
function js() {
    return src(['src/assets/js/**/*.js', '!src/assets/js/libs.js'], { base: 'src/', allowEmpty: true })
        .pipe(plumberNotify('JS Error'))
        .pipe(dest(distPath))
        .pipe(browserSync.reload({ stream: true }));
}

// IMAGES
function images() {
    return src(path.src.images, { allowEmpty: true })
        .pipe(plumberNotify('Images Error'))
        .pipe(newer(path.build.images))
        .pipe(
            gulpif(
                isProd,
                imagemin([
                    imagemin.gifsicle({ interlaced: true }),
                    imagemin.mozjpeg({ quality: 85, progressive: true }),
                    imagemin.optipng({ optimizationLevel: 5 }),
                    imagemin.svgo({ plugins: [{ removeViewBox: true }] }),
                ]),
            ),
        )
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({ stream: true }));
}

// VIDEO
function video() {
    return src(path.src.video, { allowEmpty: true })
        .pipe(plumberNotify('Video Error'))
        .pipe(newer(path.build.video))
        .pipe(dest(path.build.video))
        .pipe(browserSync.reload({ stream: true }));
}

function audio() {
    return src(path.src.audio, { allowEmpty: true })
        .pipe(plumberNotify('Audio Error'))
        .pipe(newer(path.build.audio))
        .pipe(dest(path.build.audio))
        .pipe(browserSync.reload({ stream: true }));
}

// FONTS
function fonts() {
    return src(path.src.fonts, { allowEmpty: true })
        .pipe(plumberNotify('Fonts Error'))
        .pipe(newer(path.build.fonts))
        .pipe(fonter({ formats: ['woff', 'ttf'] }))
        // Для маски со шрифтами внутри таска тоже лучше добавить allowEmpty
        .pipe(src(srcPath + 'assets/fonts/**/*.ttf', { allowEmpty: true }))
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({ stream: true }));
}

// CLEAN
function clean() {
    return del(path.clean);
}

// WATCHER
function watchFiles() {
    // В вотчерах используем опцию { allowEmpty: true } не нужно, но для надежности проверим пути
    watch([path.watch.html], html);
    watch([path.watch.css], css);
    watch(['src/assets/js/**/*.js', '!src/assets/js/libs.js'], js);
    watch(['src/assets/js/libs.js'], libs);
    watch([path.watch.images], images);
    watch([path.watch.fonts], fonts);
    watch([path.watch.video], video);
    watch([path.watch.audio], audio);
}

// TASKS
const build = series(
    clean,
    parallel(html, css, js, libs, images, fonts, video, audio),
);
const dev = series(build, parallel(watchFiles, serve));

exports.html = html;
exports.css = css;
exports.js = js;
exports.libs = libs;
exports.images = images;
exports.fonts = fonts;
exports.video = video;
exports.audio = audio;
exports.clean = clean;
exports.build = build;
exports.default = dev;
