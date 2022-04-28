const { execSync, exec } = require("child_process");
const fs = require("fs");
const { getLatestVersion } = require("./versions.js");
const zxpSignCmd = require("zxp-sign-cmd");

const here = ".";
const dist = "./dist";
const output = "./packaged";
const CSXS = "/CSXS";
const manifest = "/manifest.xml";
const cert = ".tools/cert.p12";
const cert_pw = "pw";

async function packageZxp(){

    // Get the current version from git tags
    const version = getLatestVersion();



    // Check directories exist
    if(!fs.existsSync(dist)) {
        console.error("Dist folder doesn't exist, run build first `yarn full-build`");
        process.exit(1);
    }
    if(!fs.existsSync(dist + CSXS)) {
        console.log(`Creating ${CSXS} directory`);
        fs.mkdirSync(dist + CSXS);
    }
    if(!fs.existsSync(output)) {
        console.log(`Creating ${output} directory`);
        fs.mkdirSync(output);
    }

    // Copy manifest into 'dist' folder
    const mani_from = here + CSXS + manifest;
    const mani_to = dist + CSXS + manifest;
    let manifest_txt = fs.readFileSync(mani_from).toString();
    console.log(`Setting manifest version: ${version}`);
    manifest_txt = manifest_txt.replaceAll("{version}", version);
    manifest_txt = manifest_txt.replaceAll(dist, here);
    console.log(`Copying manifest file: ${mani_from} > ${mani_to}`);
    fs.writeFileSync(mani_to, manifest_txt);

    // Check/Create cert
    if(!fs.existsSync(cert)) {
        console.log("Creating self-signed p12 certificate");
        await zxpSignCmd.selfSignedCert({
            country: "AU",
            province: "NSW",
            org: "tbyrne",
            name: "tbyrne.unreal.bridge",
            password: cert_pw,
            output: cert,
        })
        fs.rmSync(".rnd", { force:true }); // ZXPSignCmd leaves an artifact
    }

    // Package ZXP
    const dest = `${output}/Unreal Bridge ${version}.zxp`;
    if(fs.existsSync(dest)) {
        console.log(`Deleting existing ZXP: ${dest}`);
        fs.rmSync(dest);
    }
    const timeserver = "http://timestamp.digicert.com";
    console.log(`Packaging to "${dest}"`);
    await zxpSignCmd.sign({
        input: dist,
        output: dest,
        cert: cert,
        password: cert_pw,
    });

    return dest;
}

packageZxp();