const mongodb = require("../API/mongodb");

module.exports.document = {
  id: "guildId",
  xp: {
    enable: true,
    background:
      "https://nsm09.casimages.com/img/2020/06/11//20061112321725496416847262.png",
    combos: false,
    flammes: false,
    multiplicateur: 1,
  },
  raid_protection: false,
  bienvenue: {
    message: {
      title: "Nouveau membre !",
      description: "{member} a rejoint le serveur, invité par {inviter} !",
    },
    role: null,
    account_age_require: 0,
    captcha: false,
  },
  tickets: false,
  voice_manager: false,
};

module.exports.run = async (client, message, args) => {
  message.channel.send(
    "Les paramètres du bot sur le serveur ont été réinitialisés"
  );

  var oldSettings = await mongodb.get({ id: message.guild.id }, "guildsConfig");
  //console.log(oldSettings);

  var doc = this.document;

  if (oldSettings !== null) {
    console.error("Ancien serveur");
    doc.premium = oldSettings.premium;
    //console.log(doc);
  }

  if (!doc.premium) {
    doc.premium = 1;
    //console.log("premium null");
  }

  doc.id = message.guild.id;
 
  mongodb.updateDoc(doc, "guildsConfig", { id:message.guild.id });
};

module.exports.help = {
  name: "reset",
  description: "Réinitialise les paramètres du bot sur le serveur",
  perm: "ADMINISTRATOR",
};
