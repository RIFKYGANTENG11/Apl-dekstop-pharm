const gulp = require("gulp");
const { series, parallel } = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const cleanCss = require("gulp-clean-css");
const purgecss = require("gulp-purgecss");
const electron = require("electron-connect").server.create();

// Konfigurasi output
const config = {
  cssBuildPath: "assets/dist/css/",
  jsBuildPath: "assets/dist/js/",
};

// Path file
const paths = {
  syncFiles: ["index.html", "assets/js/**/*.js", "assets/css/*.css"],
  css: [
    "assets/css/bootstrap.min.css",
    "assets/css/core.css",
    "assets/css/components.css",
    "assets/css/icons.css",
    "assets/css/responsive.css",
    "assets/plugins/chosen/chosen.min.css",
    "assets/plugins/daterangepicker/daterangepicker.css",
    "assets/plugins/dataTables/jquery.dataTables.min.css",
    "assets/plugins/dataTables/dataTables.bootstrap.min.css",
    "assets/css/pages.css",
  ],
  js: [
    "renderer.js",
    "assets/plugins/bootstrap/bootstrap.min.js",
    "assets/plugins/chosen/chosen.jquery.min.js",
    "assets/plugins/jquery-ui/jquery.form.min.js",
    "assets/plugins/daterangepicker/daterangepicker.min.js",
    "assets/plugins/dataTables/jquery.dataTables.min.js",
    "assets/plugins/dataTables/dataTables.bootstrap.min.js",
    "assets/plugins/dataTables/dataTables.buttons.min.js",
    "assets/plugins/dataTables/buttons.html5.min.js",
    "assets/plugins/dataTables/pdfmake.min.js",
    "assets/plugins/dataTables/vfs_fonts.js",
    "assets/js/pos.js",
  ],
};

// Build CSS
function packCss() {
  return gulp
    .src(paths.css)
    .pipe(cleanCss({ rebaseTo: config.cssBuildPath }))
    .pipe(concat("bundle.min.css"))
    .pipe(purgecss({ content: [].concat(paths.syncFiles, paths.js) }))
    .pipe(gulp.dest(config.cssBuildPath));
}

// Build JS
function packJs() {
  return gulp
    .src(paths.js)
    .pipe(concat("bundle.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest(config.jsBuildPath));
}

// Serve Electron
function serveElectron() {
  // Start Electron app
  electron.start();

  // Restart kalau file main process berubah
  gulp.watch("main.js", electron.restart);

  // Reload kalau ada perubahan frontend (HTML/CSS/JS)
  gulp.watch(
    [].concat(paths.syncFiles, paths.css, paths.js),
    series(parallel(packCss, packJs), (done) => {
      electron.reload();
      done();
    })
  );
}

// Default task
exports.default = series(
  parallel(packCss, packJs), // build dulu
  serveElectron // lalu jalankan Electron dengan auto reload
);
