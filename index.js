const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ["USER", "GUILD_MEMBER", "CHANNEL", "MESSAGE", "REACTION"],
});

const mongodb = require("./API/mongodb.js");

const { readdirSync } = require("fs");

const config = require("./config.json");

client.login(config.TOKEN);

function loadEvent(eventName) {
  const event = require(`./events/${eventName}`);
  client.on(eventName, event.bind(null, client));
  console.log(`Evènement ${eventName} chargé`);
}

readdirSync((dir = "./events")).forEach((dirs) =>
  loadEvent(dirs.split(".")[0])
);

const express = require("express");
const app = express();
var path = require("path");
const fetch = require("node-fetch");
const FormData = require("form-data");
var cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "views")));
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("index", { cookies: req.cookies });
});
const port = process.env.PORT || "5000";
app.listen(port, () => console.log(`Server started on Port ${port}`));

app.get("/cookies/view", (req, res) => {
  res.send(req.cookies);
  console.log(req.cookies);
});

app.get("/cookies/delete", (req, res) => {
  res.clearCookie("guilds");
  res.clearCookie("user");
  res.clearCookie("code");
  res.redirect(config.redirect_url);
});

app.get("/dashboard", (req, res) => {
  if (req.cookies.guilds && !req.query.code) {
    guild_page(req.cookies.guilds, req, res);

    res.render("dashboard", {
      user_info: req.cookies.user,
      user_guilds: req.cookies.guilds,
      all_guilds: client.guilds.cache.array().map((g) => g.id),
    });
  } else {
    console.log("Pas de cookies");
    console.log(
      "Lancement de la récupération des informations auprès de discord avec le code " +
        req.query.code
    );
    if (!req.query.code) {
      res.redirect(config.redirect_url);
      return;
    }
    const data = new FormData();
    data.append("client_id", "714506093199622164");
    data.append("client_secret", "lJSXtKhvhoX_oIu4XCG6e7o89AH9uZiI");
    data.append("grant_type", "authorization_code");
    data.append("redirect_uri", `${config.redirect_url}dashboard`);
    data.append("scope", "identify%20guilds");
    data.append("code", req.query.code);

    fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: data,
    })
      .then((discordRes) => discordRes.json())
      .then(async (info) => {
        const user = await find_infos(
          "https://discord.com/api/users/@me",
          info
        );
        const guilds = await find_infos(
          "https://discord.com/api/users/@me/guilds",
          info
        );

        if (user.message === "401: Unauthorized") {
          res.redirect(`${config.redirect_url}?error=401`);
          return;
        } else {
          res.cookie(
            "guilds",
            guilds.filter((guild) => guild.permissions === 2147483647)
          );
          res.cookie("user", user);
          res.cookie("code", req.query.code);

          mongodb.update_field(
            "users",
            { id: user.id },
            { cookie: req.query.code }
          );

          guild_page(guilds, req, res);

          res.render("dashboard", {
            user_info: user,
            user_guilds: guilds.filter(
              (guild) => guild.permissions === 2147483647
            ),
            all_guilds: client.guilds.cache.array().map((g) => g.id),
          });
        }
      });
  }
});

app.post("/submit_form", (req, res) => {
  console.log(req.body);
  res.redirect("/");
});

app.post("/connect_with_discord_button", (req, res) => {
  console.log(req.body);
});

function find_infos(URL, info) {
  return fetch(URL, {
    headers: {
      authorization: `${info.token_type} ${info.access_token}`,
    },
  })
    .then((userRes) => userRes.json())
    .then((end) => {
      return end;
    });
}

function guild_page(guilds, req, res) {
  guilds
    .filter((guild) => guild.permissions === 2147483647)
    .forEach((guild) => {
      app.get(`/dashboard/${guild.id}`, (req, res) => {
        res.render("guild", {});
      });
    });
}
