const { MessageEmbed } = require("discord.js")
const { reactRole } = require("../API/mongoose")

module.exports = async (client, messageReaction, user) => {
  const roles =  await reactRole.find({message: messageReaction.message.id, reaction: messageReaction.emoji})
  roles.forEach(role => {
    messageReaction.message.guild.members.cache.get(user.id).roles.remove(role.role).then(thenBlock => {}) 
    .catch(err => messageReaction.message.channel.send(new MessageEmbed({
      color: "#FF0000",
      title: ":x: ERREUR :x:",
      description: `Impossible de supprimer <@&${role.role}> à ${user} : permissions manquantes.`
    })))
  })
}