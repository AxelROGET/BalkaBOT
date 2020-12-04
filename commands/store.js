const { MessageEmbed } = require("discord.js");
const config = require("../config.json");

module.exports.run = (client, message, args) => {
  message.channel.send(
    new MessageEmbed({
      description: "Entrez le montant à approvisionner",
      footer: "en euros, Remboursable sans fraits",
      color: config.color.orange,
    })
  );

  console.log(client.user);
  message.channel
    .awaitMessages(
      (msg) =>
        message.member.permissions.has("ADMINISTRATOR") && !message.author.bot,
      {
        max: 1,
      }
    )
    .then(console.log);
};

module.exports.help = {
  name: "store",
  description:
    "Approvisionne votre compte de coins utilisables pour améliorer le bot (1€ = 10 coins)",
  perm: "ADMINISTRATOR",
};
