const { MessageEmbed } = require("discord.js");

module.exports.run = (client, message, args) => {
  var embed = new MessageEmbed()
    .setTitle("Crack Factorio :")
    .setDescription(
      "Vous pouvez télécharger le crack de Factorio via ce lien : http://dl.free.fr/nR22LSlFn"
    )
    .setURL("http://dl.free.fr/nR22LSlFn")
    .setColor("#27b04b")
    .addField("Version : ", "1.0.0", true)
    .addField("Taille :", "1,3Go", true)
    .addField("Hébergeur : ", "Free", true)
    .addField("Mod portal officiel : ", "https://mods.factorio.com", false)
    .addField("Mod portal crack : ", "https://1488.me/factorio/mods/", false)
    .addField(
      "Les mods que j'utilise : ",
      "https://www.dropbox.com/sh/4rep95evcs6ma9e/AAB8VJw9tWluXFddzQ4EVdbZa?dl=0",
      false
    );
  message.channel.send(embed);
};

module.exports.help = {
  name: "factorio",
  description: "Toutes les informations pour crack Factorio",
  perm: null,
};
