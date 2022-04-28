const fs = require("fs");

const from = "./epr";
const to = "./dist/epr"

if(!fs.existsSync(to)) {
    console.log(`Creating EPR directory: ${to}`);
    fs.mkdirSync(to);
}

const files = fs.readdirSync(from);
for(var i=0; i<files.length; i++) {
    const file = files[i];
    console.log(`Copying EPR file: ${file}`);
    fs.copyFileSync(`${from}/${file}`, `${to}/${file}`)
}