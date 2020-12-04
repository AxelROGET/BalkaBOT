const config = require("../config.json");
const mongodb = require("../API/mongodb");
const xp = require("../xp.json");
const { MessageEmbed } = require("discord.js");

const { readdirSync } = require("fs");

const commands = [];
readdirSync("./commands").forEach((file) => commands.push(file.split(".")[0]));

module.exports = async (client, message) => {
  if (message.author.bot) return;

  // Si il s'agit d'une commande :
  if (message.content.startsWith(config.prefix)) {
    command(client, message);
  }

  if (message.channel.type === "text") {
    // Module de levels :
    mongodb
      .getUser({
        id: message.author.id,
        guild: message.guild.id,
      })
      .then((dbUser) => {
        if (
          dbUser && // test du cooldown :
          (message.createdTimestamp - dbUser.lastMsgTimestamp) / 1000 >= 60
        ) {
          // si l'utilisateur est dans la DB :
          dbUser.xp += random(15, 25);

          dbUser.lastMsgTimestamp = message.createdTimestamp;

          //console.log(dbUser)
          if (xp.levels[dbUser.level + 1] <= dbUser.xp) {
            // passage de level
            dbUser.level++;
            dbUser.xp -= xp.levels[dbUser.level];
            message.channel.send(
              `Bravo ${message.author}, tu passes au niveau ${dbUser.level} !`
            );
          }

          mongodb.update(dbUser);
        } else if (!dbUser) {
          // l'utilisateur n'est pas dans la DB :
          console.log(`New user : ${message.author.username}`);
          dbUser = {
            id: message.author.id,
            guild: message.guild.id,
            xp: random(20, 50),
            level: 0,
            lastMsgTimestamp: message.createdTimestamp,
            cookie: null,
          };
          mongodb.add(dbUser);
        }
      });
  }
};

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function command(client, message) {
  if (message.channel.type !== "text") return;
  const args = message.content.substr(1).split(" ");
  if (commands.includes(args[0])) {
    const grade = require(`../commands/${args[0]}.js`).help.perm;

    if (checkPerms(grade, message.member.permissions.toArray(), message)) {
      require(`../commands/${args[0]}.js`).run(client, message, args);
    } else {
      var embed = new MessageEmbed()
        .setTitle("Oups, un problème est survenu :confused:")
        .setDescription(
          "Vous n'avez pas la permission pour effectuer cette action !"
        )
        .setColor("#e50000");
      message.channel.send(embed);
    }
  } else {
    // La commande n'existe pas
    /* message.channel.send(
      `:x: ${message.author} cette commande n'existe pas :x:`
    ); */
  }
}

function checkPerms(require, userPerms, message) {
  if (require === "dev") {
    return config.devs.includes(message.author.id);
  } else if (require === null) return true;
  else return userPerms.includes(require);
}
