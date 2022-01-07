const { src, dest, series, parallel, watch } = require("gulp");
const sass = require('gulp-sass')(require('node-sass'));
const rename = require("gulp-rename");
const zip = require("gulp-zip");
const merge = require("merge-stream");
const os = require("os");
const path = require("path");

const buildStyles = () => {
  console.log("Compiling CSS files...");
  sass.compiler = require("node-sass");

  const regular = src("main.scss") // Get source file
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError)) // Send through a plugin
    .pipe(rename('wedding-invite.css'))
    .pipe(dest("html-preview/theme")); // Output the file in the destination folder

  return regular;
};

const includeAssets = () => {

  const wedding_invite = src([
    "assets/**"
  ]).pipe(dest("html-preview/theme/wedding-invite"));

  console.log("Including assets...");
  return wedding_invite;
};

const makeZip = () => {
  const regular = src("html-preview/theme/**").pipe(zip("wedding-invite.zip"));

  console.log(`Building releases...`);
  return regular.pipe(dest("./release"));
};

const dev = () => {
  let themeLocation;
  switch (os.type()) {
    case "Windows_NT":
      themeLocation = `${process.env.APPDATA}\\Typora\\themes`;
      break;
    case "Darwin":
      themeLocation = `${process.env.HOME}/Library/Application Support/abnerworks.Typora/themes`;
      break;
    case "Linux":
      themeLocation = "~/.config/Typora/themes";
      break;
  }

  // Watch styles
  watch(
    ["*.scss", "scss/**"],
    { ignoreInitial: false },
    function styleWatcher() {
      return themeLocation
        ? buildStyles().pipe(dest(themeLocation))
        : buildStyles();
    }
  );

  // Watch assets
  watch(
    ["assets/**"],
    { ignoreInitial: false },
    function assetWatcher() {
      return themeLocation
        ? includeAssets().pipe(dest(path.join(themeLocation, "wedding-invite")))
        : includeAssets();
    }
  );
};

const watchonly = () => {
  // Watch styles
  watch(
    ["*.scss", "scss/**"],
    { ignoreInitial: false },
    function styleWatcher() {
      return buildStyles();
    }
  );

  // Watch assets
  watch(
    ["assets/**"],
    { ignoreInitial: false },
    function assetWatcher() {
      return includeAssets();
    }
  );
}

exports.default = parallel(buildStyles, includeAssets); // I guess makes gulp 
// without arguments default to buildStyles and includeAssets Task
exports.release = series(exports.default, makeZip); // Zip and put into release/ by using "gulp release"
exports.dev = dev; // Run dev watch task using "gulp dev"
exports.watchonly = watchonly;
