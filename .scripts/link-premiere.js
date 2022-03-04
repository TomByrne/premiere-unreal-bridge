const homedir = require('os').homedir();
const path = require('path');
const fs = require('fs');
const platform = require('os').platform();
const { execSync } = require("child_process");
var elevate = require('windows-elevate');

const csxs = 'CSXS.11';
const val = 'PlayerDebugMode';

// Check PlayerDebugMode
if(platform == "win32"){
    const key = `HKEY_CURRENT_USER\\SOFTWARE\\Adobe\\${csxs}`;
    let regValue;
    try{
        regValue = execSync(`reg query ${key} /v ${val}`).toString();

        const regex = /(\d)\w*$/m;
        regValue = regValue.match(regex)[1];
    }catch(e){}

    if(regValue != "1") {
        console.log(`Setting registry key: ${key}\\${val}`);
        execSync(`reg add ${key} /v ${val} /d 1`);3
    }
} else {
    // untested
    execSync(`defaults write ~/Library/Preferences/com.adobe.${csxs}.plist ${val} 1`);
}

const extId = "imagsyd.aws.unreal";

const extPath = path.normalize(homedir + (
    platform == "win32" ? 
        "/AppData/Roaming" :
        "/Library/Application Support"
) + "/Adobe/CEP/extensions");

const destPath = path.normalize(`${extPath}/${extId}`);

const selfPath = path.resolve(__dirname, "..");

if(!fs.existsSync(extPath)) {
    console.log("Creating extension directory: ", extPath);
    fs.mkdirSync(extPath, { recursive:true });
}

if(fs.existsSync(destPath)) {
    console.error("Dest path already exists: ", destPath);
} else {
    console.log(`Creating symlink: ${destPath} > ${selfPath}`);
    elevate.exec('mklink', ['/J', destPath, selfPath], function(error) {
        if (error) {
            console.error('Failed to create symlink!', error);
        } else{
            console.log('Success!!!');
        }
    });
}

// Check initial build
const distPath = path.join(selfPath, "dist");
if(!fs.existsSync(distPath)) {
    console.log("Doing initial build...");
    execSync(`yarn build`);
}