const { readdirSync } = require("fs");
const { MessageEmbed } = require("discord.js");

const config = require("../config.json");

module.exports.run = (client, message, args) => {
  var embed = new MessageEmbed().setTitle("HELP :");

  const perms = message.member.permissions.toArray();

  //console.log(require("./config").help);

  var commands = new Array();

  const variableTemp = "config.js";

  readdirSync("./commands").forEach((dir) => {
    commands.push(require(`./${dir}`).help);
  });

  if (config.devs.includes(message.author.id)) {
    // dev
    var embed = new MessageEmbed()
      .setTitle("Commandes développeur :")
      .setColor(config.color.bleu);

    commands
      .filter((cmd) => cmd.perm === "dev")
      .forEach((cmd) => embed.addField(cmd.name, cmd.description));

    message.channel.send(embed);
  }

  if (perms.includes("ADMINISTRATOR")) {
    // admin
    var embed = new MessageEmbed()
      .setTitle("Commandes administrateur :")
      .setColor(config.color.bleu);

    commands
      .filter((cmd) => cmd.perm === "ADMINISTRATOR")
      .forEach((cmd) => embed.addField(cmd.name, cmd.description));

    message.channel.send(embed);
  }

  // plèbe
  var embed = new MessageEmbed()
    .setTitle("Commandes basiques : ")
    .setColor(config.color.bleu);

  commands
    .filter((cmd) => cmd.perm === null)
    .forEach((cmd) => embed.addField(cmd.name, cmd.description));
  message.channel.send(embed);
};

module.exports.help = {
  name: "help",
  description: "Renvoie les commandes disponibles",
  perm: null,
};
