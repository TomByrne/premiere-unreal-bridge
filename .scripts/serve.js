const { exec, execSync } = require("child_process");
const path = require('path');
const fs = require('fs');

const fe_cwd = path.resolve(__dirname, "../src_frontend");

const initPath = path.join(__dirname, "../dist/frontend");
if(!fs.existsSync(initPath)) {
    console.log("Doing initial build of frontend...");
    execSync("yarn build", {cwd:fe_cwd});
}

const be_cwd = path.resolve(__dirname, "..");
const be_cmd = "yarn run tsc --watch";
console.log("Running typescript watcher for backend");
const be = exec(be_cmd, {cwd:be_cwd});

const fe_cmd = "yarn serve";
console.log("Running vue dev server for frontend in", fe_cwd);
const fe = exec(fe_cmd, {cwd:fe_cwd});
fe.stdout.pipe(process.stdout);

setInterval(() => {
    if(be.killed){
        console.log("Backend killed, killing...");
        fe.exit();
        process.exit(be.exitCode);
    }
    if(fe.killed){
        console.log("Frontend killed, killing...");
        be.exit();
        process.exit(fe.exitCode);
    }
}, 500);