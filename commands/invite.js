const { MessageEmbed } = require("discord.js");
const config = require("../config.json");

module.exports.run = (client, message) => {
  var embed = new MessageEmbed()
    .setTitle("Invitez-moi !")
    .setDescription(
      `:white_check_mark: Vous pouvez m'inviter sur votre serveur avec ce lien :\n${config.inviteBotToGuild}`
    )
    .setURL(config.inviteBotToGuild)
    .setColor("#069740");
  //.setFooter(config.inviteBotToGuild);
  message.channel.send(embed);
};

module.exports.help = {
  name: "invite",
  description: "Envoie mon lien d'invitation",
  perm: null,
};
