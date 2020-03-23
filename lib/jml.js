const minecraft = require("./minecraft");
const mprofileinfo = require("./mprofileinfo");
const mprofile = require("./mprofile");
const mdownloader = require("./mdownloader");
const mlaunch = require("./mlaunch")
const forgedownloader = require("./forgedownloader");
const mods = require("./mods");

class jml {
    constructor() {
        this.mc = {};
        this.profiles = [];
        this.downloadEventHandler = function () { };
    }

    getGamePath() {
        return this.mc.path;
    }

    async initialize(path) {
        this.mc = await minecraft.initialize(path);
    }

    async updateProfiles() {
        this.profiles = await mprofileinfo.getProfiles(this.mc);
        return this.profiles;
    }

    async getProfile(name) {
        if (!this.profiles || this.profiles.length == 0) {
            await this.updateProfiles();
        }

        return await mprofile.get_profile(this.mc, this.profiles, name);
    }

    async downloadProfile(profile, downloadAssets = true) {
        var downloader = new mdownloader.mdownload(profile);
        downloader.downloadFileChanged = this.downloadEventHandler;
        await downloader.downloadAll(downloadAssets);
    }

    async downloadForge(mcversion, forgeversion) {
        await forgedownloader.installForgeLibraries(this.mc, mcversion, forgeversion, this.downloadEventHandler);
    }

    async downloadMods(mod) {
        await mods.checkMods(this.mc, mod, false, this.downloadEventHandler);
    }

    getVersionName(mcversion, forgeversion) {
        return `${mcversion}-forge${mcversion}-${forgeversion}`;
    }

    // opt.xmx
    // opt.server_ip
    // opt.screen_width
    // opt.screen_height
    // opt.session = { username, uuid, access_token }
    async launch(name, opt) {
        var profile = await this.getProfile(name);
        await this.downloadProfile(profile);

        opt.startProfile = profile;
        var launch = new mlaunch.launch(opt);
        return await launch.createProcess();
    }
}

module.exports = {
    jml: jml
}