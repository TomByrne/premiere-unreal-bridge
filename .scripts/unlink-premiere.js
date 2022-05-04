const homedir = require('os').homedir();
const path = require('path');
const fs = require('fs');
const platform = require('os').platform();
var extId = require('../package.json').name;


const extPath = path.normalize(homedir + (
    platform == "win32" ? 
        "/AppData/Roaming" :
        "/Library/Application Support"
) + "/Adobe/CEP/extensions");

const destPath = path.normalize(`${extPath}/${extId}`);

if(fs.existsSync(destPath)) {
    console.error("Removing plugin folder: ", destPath);
    fs.rmdirSync(destPath);

} else {
    console.error(`No plugin directory found at: `, destPath);
    process.exit(1);
}