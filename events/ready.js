const mongodb = require("../API/mongodb");
const Discord = require("discord.js");

const guildInvites = new Map();

module.exports = (client) => {
  // invite manager :
  console.log(`${client.user.username} is online !`);
  client.guilds.cache.forEach((guild) => {
    guild
      .fetchInvites()
      .then((invites) => guildInvites.set(guild.id, invites))
      .catch((err) => console.error(err));
  });

  module.exports.invites = guildInvites;

  mongodb.start();

  client.user.setActivity("!help", { type: "WATCHING" });

  module.exports.client = client;

  /* client.channels.cache.get("693495587995385881").send(
    new Discord.MessageEmbed({
      color: "#069740",
      description: `${client.user.username} is online`,
    })
  ); */
};
