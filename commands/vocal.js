module.exports.help = {
  name: "vocal",
  description: "Gestion des salons vocaux et des utilisateurs",
  perm: "ADMINISTRATOR",
};

module.exports.run = (client, message, args) => {
  switch (args[1]) {
    case "mute-all":
      mute_all(client, message, args);
      return;

    case "unmute-all":
      unmute_all(client, message, args);
      return;

    default:
      message.channel.send("Agument incorrect");
  }
};

function mute_all(client, message, args) {
  message.member.voice.channel.members.forEach((member) => {
    member.voice.setMute(true);
  });
}

function unmute_all(client, message, args) {
  message.member.voice.channel.members.forEach((member) => {
    member.voice.setMute(false);
  });
}
