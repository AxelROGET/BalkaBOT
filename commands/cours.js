module.exports.run = (client, message, args) => {
  message.channel.send(
    "J'écris un cours sur le javascript et sur la librairie Discord. \nLe code est **__jjv7pyz__** sur Google Classroom."
  );
  message.delete();
};

module.exports.help = {
  name: "cours",
  description: "Détails du cours Javascript",
  perm: "dev",
};