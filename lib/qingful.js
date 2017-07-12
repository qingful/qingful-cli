const Router = require("koahub-router");
const util = require("./util");
const path = require("path");
const Table = require("cli-table2");
const pkg = require("./../package.json");
const qingfulJsonPath = path.resolve(process.env.HOME, ".qingful.json");

const router = new Router();

router.use("version", async (ctx, next) => {
  console.log(pkg.version);
});

router.use("help", async (ctx, next) => {
  console.log();
  console.log("  Help:");
  console.log();
  console.log("    $ qingful config --registry 192.168.0.1");
  console.log("    $ qingful register --username test --password test");
  console.log("    $ qingful login --username test --password test");
  console.log("    $ qingful git list");
  console.log("    $ qingful git add --name test --repo test");
  console.log("    $ qingful git auth --repo test --username test");
  console.log("    $ qingful git deploy --path test --repo test");
  console.log(
    "    $ qingful git nginx --domain test --path test --port 3000  静态资源需要设置path，后台需要设置port"
  );
  console.log("    $ qingful git install --path test");
  console.log("    $ qingful git start --path test");
  console.log("    $ qingful git post_receive --repo test --path test");
  console.log();
});

router.use("config --registry :registry", async (ctx, next) => {
  let newJson = await util.writeJson(qingfulJsonPath, {
    registry: ctx.params.registry
  });
  console.log(newJson);
});

router.use(
  "register --username :username --password :password",
  async (ctx, next) => {
    let body = await util.request("/home/public/register", {
      username: ctx.params.username,
      password: ctx.params.password
    });

    console.log(body);
  }
);

router.use(
  "login --username :username --password :password",
  async (ctx, next) => {
    let body = await util.request("/home/public/login", {
      username: ctx.params.username,
      password: ctx.params.password
    });
    if (body.data.token) {
      await util.writeJson(qingfulJsonPath, {
        Authorization: body.data.token
      });
      console.log("登录成功");
    } else {
      console.log(body.data || "登录失败");
    }
  }
);

router.use(
  "login --username :username --password :password",
  async (ctx, next) => {
    let body = await util.request("/home/public/login", {
      username: ctx.params.username,
      password: ctx.params.password
    });
    if (body.data.token) {
      await util.writeJson(qingfulJsonPath, {
        Authorization: body.data.token
      });
      console.log("登录成功");
    } else {
      console.log(body.data || "登录失败");
    }
  }
);

router.use("git list", async (ctx, next) => {
  let json = await util.readEnsureJson(qingfulJsonPath);
  let body = await util.request("/home/git/index");
  if (!body) {
    return;
  }
  let table = new Table({
    head: ["名称", "仓库", "地址"]
  });

  for (let key in body.data.data) {
    table.push([
      body.data.data[key].git.name,
      body.data.data[key].git.repo,
      json.registry + "/" + body.data.data[key].git.repo + ".git"
    ]);
  }
  console.log(table.toString());
});

router.use("git auth --repo :repo --username :username", async (ctx, next) => {
  let body = await util.request(
    `/home/git/auth?repo=${ctx.params.repo}&username=${ctx.params.username}`
  );
  console.log(body);
});

router.use("git add --name :name --repo :repo", async (ctx, next) => {
  let body = await util.request(
    `/home/git/add?name=${ctx.params.name}&repo=${ctx.params.repo}`
  );
  console.log(body);
});

router.use("git deploy --name :name --repo :repo", async (ctx, next) => {
  let body = await util.request(
    `/home/git/deploy?name=${ctx.params.name}&repo=${ctx.params.repo}`
  );
  console.log(body);
});

router.use("git nginx --domain :domain --path :path", async (ctx, next) => {
  let body = await util.request(
    `/home/git/nginx?domain=${ctx.params.domain}&path=${ctx.params.path}`
  );
  console.log(body);
});

router.use("git nginx --domain :domain --port :port", async (ctx, next) => {
  let body = await util.request(
    `/home/git/nginx?domain=${ctx.params.domain}&port=${ctx.params.port}`
  );
  console.log(body);
});

router.use("git install --path :path", async (ctx, next) => {
  let body = await util.request(`/home/git/install?path=${ctx.params.path}`);
  console.log(body);
});

router.use("git start --path :path", async (ctx, next) => {
  let body = await util.request(`/home/git/start?path=${ctx.params.path}`);
  console.log(body);
});

router.use("git post_receive --repo :repo --path :path", async (ctx, next) => {
  let body = await util.request(
    `/home/git/post_receive?repo=${ctx.params.repo}&path=${ctx.params.path}`
  );
  console.log(body);
});

router.parse(process.argv);
