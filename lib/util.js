const fse = require("fs-extra");
const got = require("got");
const path = require("path");
const qingfulJsonPath = path.resolve(process.env.HOME || process.env.HOMEPATH, ".qingful.json");

module.exports = {
	async request(url, params, options = {}) {
		const json = await this.readEnsureJson(qingfulJsonPath);
		if (!json.registry) {
			console.log("请先配置服务器域名/IP");
			return;
		}
		url = json.registry + url;
		if (json.Authorization) {
			options.headers = {
				Authorization: json.Authorization
			};
		}
		options.json = true;

		if (params) {
			options.body = params;
			const res = await got.post(url, options).catch(err => {
				if (err.statusCode == 401) {
					console.log("授权失败");
				} else {
					console.log(err);
				}
			});
			if (res) {
				return res.body;
			} else {
				return;
			}
		} else {
			const res = await got.get(url, options).catch(err => {
				if (err.statusCode == 401) {
					console.log("授权失败");
				} else {
					console.log(err);
				}
			});
			if (res) {
				return res.body;
			} else {
				return;
			}
		}
	},

	async readEnsureJson(path) {
		const qingfulJsonExists = await fse.pathExists(path);
		if (qingfulJsonExists) {
			return await fse.readJson(path);
		} else {
			await fse.ensureFile(path);
			await fse.writeJson(path, {});
			return await fse.readJson(path);
		}
	},

	async writeJson(path, json) {
		let newJson;
		try {
			newJson = await this.readEnsureJson(path);
			newJson = Object.assign(newJson, json);
			await fse.writeJson(path, newJson);
		} catch (err) {}
		return newJson;
	}
};
