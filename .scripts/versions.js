const { execSync } = require("child_process");
var sort = require('version-sort');

const version_tag_dir = "version";

exports.getVersions = function() {
    const versions_raw = execSync(`git tag -l ${version_tag_dir}/*`).toString().split("\n");
    for (var i = 0; i < versions_raw.length; i++) {
        versions_raw[i] = versions_raw[i].replace(`${version_tag_dir}/`, '');
    }
    if(versions_raw[versions_raw.length-1] == '') versions_raw.pop();
    return versions_raw.length > 1 ? sort(versions_raw) : versions_raw;
}
exports.getLatestVersion = function() {
    const versions = exports.getVersions();
    return versions[versions.length - 1];
}