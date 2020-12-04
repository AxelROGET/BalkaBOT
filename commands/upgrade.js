const Discord = require("discord.js");
const config = require("../config.json")

module.exports.run = (client, message, args) => {
    var embed = new Discord.MessageEmbed()
        .setTitle("Upgrade le bot")
        .setDescription("Vous vous sentez trop limité par les fonctionnalités que propose **Assist-bot** ?\nVous pouvez upgrade en contactant <@390482321364484096>.")
        .addField("Fonctionnalités : ", "https://rebrand.ly/assist-bot")
        .setColor(config.color.orange)
    message.channel.send(embed)
};

module.exports.help = {
    name: "upgrade",
    description: "Upgrade le bot sur ce serveur",
    perm: "ADMINISTRATOR"
}