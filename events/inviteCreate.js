const guildInvites = new Map();

module.exports = (client) => {
  client.guilds.cache.forEach((guild) => {
    guild
      .fetchInvites()
      .then((invites) => guildInvites.set(guild.id, invites))
      .catch((err) => console.error(err));
  });

  module.exports.invites = guildInvites;
};
