const mongodb = require("../API/mongodb");

module.exports.help = {
  name: "reset-all",
  description:
    "Reset les paramètres de tous les serveurs lors d'une modification du format de stockage dans la base de donnée.",
  perm: "dev",
};

module.exports.run = async (client, message, args) => {
  console.log("reset de tous les serveurs");

  client.guilds.cache.forEach(async (guild) => {
    var oldSettings = await mongodb.get({ id: guild.id }, "guildsConfig");

    var doc = require("./reset").document;

    if (oldSettings !== null) {
      //console.error("Ancien serveur");
      doc.premium = oldSettings.premium;
      //console.log(doc);
    }

    if (!doc.premium) {
      doc.premium = 1;
      //console.log("premium null");
    }

    doc.id = guild.id;

    mongodb.updateDoc(doc, "guildsConfig", { id: guild.id });
  });
};
