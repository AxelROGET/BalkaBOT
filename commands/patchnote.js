const { MessageEmbed } = require("discord.js");
const config = require("../config.json");

module.exports.run = (client, message, args) => {
  if (message.author.id !== "390482321364484096") {
    message.channel.send(
      `:x: ${message.author}, vous n'êtes pas autorisé à déployer des **notes de patch** :x:`
    );
    return;
  } else if (!args[1]) {
    message.channel.send(
      `:x: ${message.author}, vous devez inclure un texte à envoyer dans la **note de patch** :x:`
    );
  } else {
    var embed = new MessageEmbed()
      .setTitle(`PATCH NOTE :`)
      .setURL(config.guildDefaultUrlInvite)
      .setAuthor(client.user.username, client.user.avatarURL())
      .setFooter("Bot discord par Axel ROGET")
      .setColor("#32a852")
      .setDescription(
        `Une nouvelle mise à jour vient d'être déployée. Elle inclue : \n${message.content.substr(
          10
        )}`
      );
    client.guilds.cache.forEach((g) =>
      g.channels.cache.find((channel) => channel.type === "text").send(embed)
    );
  }
};

module.exports.help = {
  name: "patchnote",
  description: "Envoie le patch note sur tous les serveurs",
  perm: "dev",
};
