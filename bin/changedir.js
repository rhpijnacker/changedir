let fs = require('fs');
let _ = require('lodash');
let path = require('path');

let stateFile = path.resolve(process.env['APPDATA'], 'changedir.state.json');
let dirStack = readState();
let searchDir = process.argv.slice(2).join('/');
let searchRe = new RegExp(searchDir.replace(/[\/\\]/g, '.*[\\\\/].*'), 'i');

if (fs.existsSync(searchDir)) {
  // Argument is a complete directory; go there without asking.
  // Use an absolute path.
  searchDir = path.resolve(searchDir);
  changeToFoundDirAndExit(searchDir);
}

let foundDirs = dirStack.filter((dir) => searchRe.test(dir));
let cwd = process.cwd();
while (foundDirs.length) {
  // Take nearest match
  let minDistance = Infinity;
  let foundDir;
  foundDirs.forEach((dir) => {
    let distance = dirDistance(cwd, dir);
    if (distance < minDistance) {
      foundDir = dir;
      minDistance = distance;
    }
  });
  changeToFoundDirAndExit(foundDir); // exits
  _.pull(foundDirs, foundDir);
}

function readState() {
  let dirStack = fs.existsSync(stateFile) ? require(stateFile) : [];
  return dirStack;
}

function saveState(dirStack) {
  dirStack = _.reverse(dirStack);
  dirStack = _.uniq(dirStack);
  dirStack = _.reverse(dirStack);
  fs.writeFileSync(stateFile, JSON.stringify(dirStack, null, 2)); 
}

// cd into correct dir, save state and exit.
function changeToFoundDirAndExit(dir) {
  if (fs.existsSync(dir)) {
    console.log(`@cd /d ${dir}`);
    dirStack.push(dir);
    saveState(dirStack);
    // Success!
    process.exit(0);
  } else {
    console.error(`Could not find directory '${dir}; skipping`);
    _.pull(dirStack, dir);
    return false;
  }
}

function dirDistance(dir1, dir2) {
  let parts1 = _.compact(dir1.toLowerCase().split(/[\\\/]/));
  let parts2 = _.compact(dir2.toLowerCase().split(/[\\\/]/));
  return arrayDistance(parts1, parts2);
}

function arrayDistance(arr1, arr2) {
  return _.difference(arr1, arr2).length + _.difference(arr2, arr1).length;
}
