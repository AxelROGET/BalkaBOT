const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ["USER", "GUILD_MEMBER", "CHANNEL", "MESSAGE", "REACTION"],
});
require("./API/mongoose");

require("dotenv").config();

const mongodb = require("./API/mongodb.js");

const { readdirSync } = require("fs");

const config = require("./config.json");

client.login(process.env.TOKEN);

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
const { reactRole, privateVoice, guildsConfig, connectionTokens } = require("./API/mongoose");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "views")));
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("index", { cookies: req.cookies });
});
const port = process.env.PORT || "5000";
app.listen(port, () => console.log(`Server started on Port ${port}`));

/* app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}); */

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

          connectionTokens.updateOne({user: user.id}, {token: req.query.code}, {upsert: true, new: true}).then(result => {})

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

app.use("/submit_form", (req, res) => {
  switch (req.body.type) {
    case "autorole":
      require("./config/autorole")(req, res);
      break;
  }
});

app.use("/getMessageContent", (req, res) => {
  client.guilds.cache
    .get(req.body.guildId)
    .channels.cache.array()
    .forEach((channel) => {
      if (channel.type === "text" || channel.type === "news") {
        channel.messages
          .fetch(req.body.messageId)
          .then((message) => {
            res.json(message.content);
          })
          .catch((catchBlock) => {});
      }
    });
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

app.get("/*", async (req, res) => {

  // Si c'est le chargement d'une guild :
  if(req.path.split("/")[1] == "dashboard" && req.cookies.user.id){
    if(client.guilds.cache.get(req.path.split("/")[2]).members.cache.get(req.cookies.user.id).permissions.has("ADMINISTRATOR") && await connectionTokens.findOne({user: req.cookies.user.id, token: req.cookies.code})){

      //Si l'utilisateur est ADMIN sur le serveur
      const guildId = req.path.split("/")[2];
      const guildConfig = await guildsConfig.findOne({id: guildId})
      const reactRoleDB = await reactRole.find({guild: guildId})
      let guildReactRole = [];
      reactRoleDB.forEach((i) => {
        guildReactRole.push({
          message: i.messageContent,
          reaction: i.reaction,
          role: client.guilds.cache.get(guildId).roles.cache.get(i.role).name,
          token: i._id,
        });
      });

      res.render("guild", {
        guildConfig: guildConfig,
        roles: client.guilds.cache
        .get(guildId)
        .roles.cache.array()
        .filter((role) => role.name !== "@everyone"),
      reactRoles: guildReactRole,
      })
    }else{
      //Si l'utilisateur n'est PAS ADMIN sur le serveur
      res.send("Vous devez être administrateur sur ce serveur.")
    }
  } else {
    // Si c'est une page inconnue
    const url = req.path.substring(1)
    const moveChannel = await privateVoice.findOne({code: url});
    
    if(moveChannel){
      const transfert = await client.guilds.cache.get(moveChannel.guild).channels.create("Transfert", {type: "voice", userLimit: 1});
      const invite = await transfert.createInvite({maxAge: 120, maxUses: 1})
      res.render(`https://discord.gg/${invite.code}`)
      console.log(invite.code)
    } else res.redirect(config.redirect_url)
  }


})