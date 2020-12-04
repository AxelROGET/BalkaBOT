const Discord = require("discord.js");
const mongodb = require("../API/mongodb");
const { watch } = require("fs");
const { title } = require("process");

// ["1️⃣", "2️⃣" , "3️⃣", "4️⃣", "5️⃣"]

const color = require("../config.json").color;

module.exports.help = {
  name: "config",
  description: "configurer le bot sur ce serveur",
  perm: "ADMINISTRATOR",
};

module.exports.run = async (client, message, args) => {
  var guildConfig = await mongodb.get({ id: message.guild.id }, "guildsConfig");
  // si il n'y a pas d'arguments
  if (!args[1]) {
    var embed = new Discord.MessageEmbed()
      .setTitle("Configuration :")
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setColor("#faae16")
      .setDescription(
        `Forfait : ${forfait(
          guildConfig.premium
        )}\n\nPour configurer le bot sur ce serveur, mettez la réaction correspondante au paramètre à modifier.`
      )
      .addField(
        ":one: Expérience",
        "Active ou désactive la fonction d'XP sur ce serveur ainsi que la commande !xp."
      )
      .addField(
        ":two: Nouvel utilisateur",
        "Message envoyé lorsqu'un utilisateur rejoint le serveur."
      )
      .setFooter("Seuls les administrateurs peuvent paramétrer le serveur.");

    message.channel
      .send(embed)
      .then((msg) => config(msg))
      .catch((err) => console.warn(err));
  }
};

async function config(msg) {
  var guildConfig = await mongodb.get({ id: msg.guild.id }, "guildsConfig");

  ["1️⃣", "2️⃣" , "3️⃣", "4️⃣", "5️⃣"].forEach((r) => msg.react(r));

  // tester si l'utilisateur est admin et si ce n'est pas le bot
  const filter = (reaction, user) =>
    user.id !== msg.author.id &&
    msg.guild.members.cache.get(user.id).permissions.has("ADMINISTRATOR");

  //const result = await waitReaction(msg, filter)

  switch(await waitReaction(msg, filter)){
    case "1️⃣":
      config_xp(msg, filter, guildConfig);
      break;
    case "2️⃣":
      config_newUser(msg, filter, guildConfig);
      break;
    case "3️⃣":

    case "4️⃣":

    case "5️⃣":

  }
}

async function config_xp(message, filter, guildConfig) {
  //console.log(message)
  var embed = new Discord.MessageEmbed()
    .setTitle("Configuration XP :")
    .addField(":one: XP :", enable(guildConfig.xp.enable))
    .addField(":two: Multiplicateur :", guildConfig.xp.multiplicateur)
    .addField(":three: Combos :", enable(guildConfig.xp.combos))
    .addField(":four: Flammes :", enable(guildConfig.xp.flammes))
    .addField(":five: Arrière-plan :", guildConfig.xp.background)
    .setImage(guildConfig.xp.background)
    .setColor("#faae16");
    message.edit(embed);
    switch(await waitReaction(message, filter)){
      case "1️⃣":
        config_xp_enable(message, filter, guildConfig);
        break;
      case "2️⃣":
        config_xp_multiplicateur(message, filter, guildConfig);
        break;
      case "3️⃣":
        config_xp_combos(message, filter, guildConfig);
        break;
      case "4️⃣":
        config_xp_flammes(message, filter, guildConfig);
        break;
      case "5️⃣":
        config_xp_background(message, filter, guildConfig);
        break;
    }
}

async function config_xp_enable(message, filter, guildConfig) {
  var embed = new Discord.MessageEmbed()
    .setColor("#faae16")
    .addField("oui : ✅", "\u200b", true)
    .addField("non : ❌", "\u200b", true)
  if (guildConfig.xp.enable) {
    embed.setTitle("Désactiver l'XP ?");
    embed.setDescription(
      "Vous êtes sur le point de désactiver l'XP sur ce serveur.\nVoulez-vous continuer ?"
    );
  } else {
    embed.setTitle("Activer l'XP ?");
    embed.setDescription(
      "Vous êtes sur le point d'activer l'XP sur ce serveur.\nVoulez-vous continuer ?"
    );
  }
  message.edit(embed);

    ["✅", "❌"].forEach((r) => message.react(r));

    switch(await waitReaction(message, filter)){
      case "✅":
        if(guildConfig.xp.enable){
          message.channel.send("```XP désactivé```");
          guildConfig.xp.enable = false;
          mongodb.updateDoc(guildConfig, "guildsConfig", {
            id: message.guild.id,
          });
        } else {
          message.channel.send("```XP Activé```");
          guildConfig.xp.enable = true;
          mongodb.updateDoc(guildConfig, "guildsConfig", {
            id: message.guild.id,
          });
        }
        break;
      
      default: 
        message.channel.send(":x: Annulation :x:");
        break;
    }
}

function config_xp_multiplicateur(message, filter, guildConfig) {
  if (guildConfig.premium === 3) {
    // Si le serveur est GOLD
    var embed = new Discord.MessageEmbed()
      .setTitle("Nouveau multiplicateur :")
      .setDescription(
        "Entrez le nouveau multiplicateur pour modifier ce dernier."
      )
      .setColor("#1fc600");
    message.edit(embed)
      message.channel.awaitMessages((message) => message.member.permissions.has("ADMINISTRATOR"),{ max: 1 })
        .then((msg) => {
          const multiplicateur = parseFloat(
            msg.first().content.replace(",", ".")
          );
          if (!isNaN(multiplicateur)) {
            guildConfig.xp.multiplicateur = multiplicateur;
            mongodb.updateDoc(guildConfig, "guildsConfig", {
              id: message.guild.id,
            });
            message.channel.send(
              `Le multiplicateur a bien été modifié à **${multiplicateur}** !`
            );
          } else {
            message.channel.send(
              ":x: Le multiplicateur entré est incorrect. Veuillez entrer un nombre. :x:"
            );
          }
        });
  } else {
    // Si le serveur n'est pas GOLD
    premiumRequière(message, "Gold", "modifier le multiplicateur d'XP")
  }
}

async function config_xp_combos(message, filter, guildConfig) {
  var embed = new Discord.MessageEmbed();

  if (guildConfig.premium === 1) {
    premiumRequière(message, "silver", "utiliser les combos");
    return;
  } else if (guildConfig.xp.combos) {
    embed
      .setTitle("Désactiver les combos ?")
      .setDescription(
        "Vous êtes sur le point de désactiver les combos.\nVoulez-vous continuer ?\n\nLes combos permettent de favoriser les personnes fidèles à votre serveur en donnant des multiplicateurs d'XP de plus en plus élevé en étant actif régulièrement.\nLes combos se déclenchent lorsqu'une personne envoie 10 messages par jour pendant 3 jours et ajoutant 0,20 au multiplicateur par jour."
      )
      .setColor("#e50000");
  } else {
    embed
      .setTitle("Activer les combos ?")
      .setDescription(
        "Vous êtes sur le point d'activer les combos.\nVoulez-vous continuer ?\n\nLes combos permettent de favoriser les personnes fidèles à votre serveur en donnant des multiplicateurs d'XP de plus en plus élevé en étant actif régulièrement.\nLes combos se déclenchent lorsqu'une personne envoie 10 messages par jour pendant 3 jours et ajoutant 0,20 au multiplicateur par jour."
      )
      .setColor("#1fc600");
  }

  message.edit(embed);
  ["✅", "❌"].forEach((r) => message.react(r));

  switch(await waitReaction(message, filter)){
    case "✅":
      if(guildConfig.xp.combos){
        // désactiver les combos
        guildConfig.xp.combos = false;
        mongodb.updateDoc(guildConfig, "guildsConfig", { id: message.guild.id });
        message.channel.send("```Combos désactivés```")
      } else {
        // activer les combos
        guildConfig.xp.combos = true;
        mongodb.updateDoc(guildConfig, "guildsConfig", { id: message.guild.id });
        message.channel.send("```Combos activés```")
      }
      break;

    default: message.channel.send(":x: Annulation :x:"); break;
  }
}

async function config_xp_flammes(message, filter, guildConfig) {
  var embed = new Discord.MessageEmbed();

  if (guildConfig.premium === 1) {
    premiumRequière(channel, "silver", "utiliser les flammes");
    return;
  } else if (guildConfig.xp.flammes) {
    embed
      .setTitle("Désactiver les flammes ?")
      .setDescription(
        "Vous êtes sur le point de désactiver les flammes.\nVoulez-vous continuer ?\n\nLes flammes permettent de favoriser les personnes fidèles à votre serveur en ajoutant un flamme à côté des pseudos des utilisateurs les plus actifs. Ces flammes apparaissent lorqu'un utilisateur envoie 10 messages par jour pendant au minimum 5 jours."
      )
      .setColor("#e50000");
  } else {
    embed
      .setTitle("Activer les flammes ?")
      .setDescription(
        "Vous êtes sur le point d'activer les combos.\nVoulez-vous continuer ?\n\nLes combos permettent de favoriser les personnes fidèles à votre serveur en donnant des multiplicateurs d'XP de plus en plus élevé en étant actif régulièrement.\nLes combos se déclenchent lorsqu'une personne envoie 10 messages par jour pendant 3 jours et ajoutant 0,20 au multiplicateur par jour."
      )
      .setColor("#1fc600");
  }

  message.edit(embed);
  ["✅", "❌"].forEach((r) => message.react(r));

  switch(await waitReaction(message, filter)){
    case "✅":
      if(guildConfig.xp.flammes){
        // désactiver les flammes
        guildConfig.xp.flammes = false;
        mongodb.updateDoc(guildConfig, "guildsConfig", { id: message.guild.id });
        message.channel.send("```Flammes désactivés```")
      } else {
        // activer les flammes
        guildConfig.xp.flammes = true;
        mongodb.updateDoc(guildConfig, "guildsConfig", { id: message.guild.id });
        message.channel.send("```Flammes activés```")
      }
      break;

    default: message.channel.send(":x: Annulation :x:"); break;
  }
}

function config_xp_background(message, filter, guildConfig) {
  if (guildConfig.premium === 1) {
    premiumRequière(channel, "silver", "modifier l'arrière-plan");
    return;
  } else {
    var embed = new Discord.MessageEmbed()
      .setTitle("Modification de l'arrière-plan :")
      .setDescription(
        "Entrez l'URL de l'arrière-plan de votre choix pour modifier les cartes d'XP.\nLe bot s'occupera de redimensionner l'image.\nEntrez ``cancel`` pour annuler l'opération"
      )
      .setColor(color.vert)
      .setImage(guildConfig.xp.background)
      .setFooter(
        "Attention, le bot n'héberge pas l'image ! Veuillez à ce qu'elle reste en ligne au même URL."
      );
    message.edit(embed)
      message.channel
        .awaitMessages(
          (msg) => msg.member.permissions.has("AMINISTRATOR"),
          { max: 1 }
        )
        .then((msg) => {
          var embed = new Discord.MessageEmbed();

          if (msg.first().content === "cancel") {
            embed.setColor("#e50000").setTitle("Modification annulée");
          } else {
            embed
              .setColor(color.vert)
              .setTitle("Arrière-plan modifié")
              .setDescription("L'arrière-plan a bien été modifié.")
              .setImage(msg.first().content);
            message.edit(embed);
            guildConfig.xp.background = msg.first().content;
            mongodb.updateDoc(guildConfig, "guildsConfig", {
              id: channel.guild.id,
            });

            msg.delete();
          }
        });
  }
}

async function config_newUser(message, filter, guildConfig) {
  var ageCompteRequire = (variable) => {
    if(variable === 0) return "❌ Désactivé";
    else return `${variable} semaines minimum`
  }
  var embed = new Discord.MessageEmbed()
    .setTitle("Arrivée d'un utilisateur :")
    .setColor(color.orange)
    .setDescription("Configuration des arrivées d'utilisateurs :")
    .addField(":one: Titre du message :", guildConfig.bienvenue.message.title)
    .addField(
      ":two: Corps du message : ",
      guildConfig.bienvenue.message.description
    )
    .addField(":three: Rôle automatique : ", role(guildConfig))
    .addField(":four: Âge du compte minimum", ageCompteRequire(guildConfig.bienvenue.account_age_require))
    .addField(":five: Captcha", enable(guildConfig.bienvenue.captcha));
    message.edit(embed);

    switch(await waitReaction(message, filter)){
      case "1️⃣":
        config_newUser_title(message, filter, guildConfig);
        break;
      case "2️⃣":
        config_newUser_description(message, filter, guildConfig);
        break;
      case "3️⃣":
        config_newUser_role(message, filter, guildConfig);
        break;
      case "4️⃣":
        config_newUser_age_account(message, filter, guildConfig);
        break;
      case "5️⃣":
        config_newUser_captcha(message, filter, guildConfig);
        break;
    }
}

function config_newUser_title(message, filter, guildConfig){
  // tester si le serveur est premium
  if(guildConfig.premium === 1){
    premiumRequière(message, "silver", "changer le message d'accueil")
    return;
  }

  var embed = new Discord.MessageEmbed()
    .setTitle("Titre du message d'accueil")
    .setDescription("Entrez le nouveau **titre du message d'accueil**.\nLe message d'accueil est envoyé lors de l'arrivée d'un utilisateur.\nVous pouvez entrer ``cancel`` pour annuler.\nVous pouvez inclure des informations variables :")
    .addField("Mentionner le nouveau membre :", "{member}")
    .addField("Personne à l'origine de l'invitation :", "{inviter}")
    .addField("Lien d'invitation utilisé :", "{link}")
    .addField("Compteur de membres :", "{counter}")
    .setColor(color.orange)
    message.edit(embed)

    message.channel.awaitMessages(
      (msg) => msg.member.permissions.has("AMINISTRATOR"),
      { max: 1 }
    ).then(collected => {
      var msg = collected.first();
      if(msg.content === "cancel"){
        message.channel.send(":x: Annulation :x:");
        return;
      } else {
        guildConfig.bienvenue.message.title = msg.content;
        mongodb.updateDoc(guildConfig, "guildsConfig", {id: message.guild.id})
        message.edit(new Discord.MessageEmbed().setTitle("Titre du message modifié").setDescription("Le titre du message d'accueil a été modifié avec succès. Le nouveau titre est ``"+msg.content+"``.").setColor(color.vert))
      }
    })
}

function config_newUser_description(message, filter, guildConfig){
  // tester si le serveur est premium
  if(guildConfig.premium === 1){
    premiumRequière(message, "silver", "changer le message d'accueil")
    return;
  }

  var embed = new Discord.MessageEmbed()
    .setTitle("Corps du message d'accueil")
    .setDescription("Entrez le nouveau **corps du message d'accueil**.\nLe message d'accueil est envoyé lors de l'arrivée d'un utilisateur.\nVous pouvez entrer ``cancel`` pour annuler.\nVous pouvez inclure des informations variables :")
    .addField("Mentionner le nouveau membre :", "{member}")
    .addField("Personne à l'origine de l'invitation :", "{inviter}")
    .addField("Lien d'invitation utilisé :", "{link}")
    .addField("Compteur de membres :", "{counter}")
    .setColor(color.orange)
    message.edit(embed)

    message.channel.awaitMessages(
      (msg) => msg.member.permissions.has("AMINISTRATOR"),
      { max: 1 }
    ).then(collected => {
      var msg = collected.first();
      if(msg.content === "cancel"){
        message.channel.send(":x: Annulation :x:");
        return;
      } else {
        guildConfig.bienvenue.message.description = msg.content;
        mongodb.updateDoc(guildConfig, "guildsConfig", {id: message.guild.id})
        message.edit(new Discord.MessageEmbed().setTitle("Titre du message modifié").setDescription("Le corps du message d'accueil a été modifié avec succès. Le nouveau corps est ``"+msg.content+"``.").setColor(color.vert))
      }
    })
}

function config_newUser_role(message, filter, guildConfig){
  message.edit(new Discord.MessageEmbed().setTitle("Rôle automatique :").setDescription("Mentionnez le nouveau rôle automatique.\nCelui-ci sera ajouté lorsqu'un utilisateur rejoint le serveur après vérification humaine (si vous l'avez activé).\nEntrez :").addField("``cancel``", "pour annuler").addField("``none``", "pour désactiver le rôle automatique.").setColor(color.orange))

  message.channel.awaitMessages(
    (msg) => msg.member.permissions.has("AMINISTRATOR"),
    { max: 1 }
  ).then(collected => {
    var msg = collected.first();
    var role = msg.mentions.roles.first();
    if(msg.content === "cancel"){
      message.channel.send(":x: Annulation :x:");
      return;
    } 
    else if (msg.content === "none"){ // supprimer le rôle
      message.channel.send(":x: Rôle automatique désactivé :x:");
      guildConfig.bienvenue.role = null
      mongodb.updateDoc(guildConfig, "guildsConfig", {id: msg.guild.id})
    }
    else if(role){ // si le rôle est correct :
      message.edit(new Discord.MessageEmbed().setTitle("Rôle automatique modifié").setDescription("Le rôle attribué lorsqu'un utilisateur rejoint est "+ `<@&${role.id}>.`).setColor(color.vert));
      guildConfig.bienvenue.role = role.id;
      mongodb.updateDoc(guildConfig, "guildsConfig", {id: msg.guild.id})
      } else {
        message.edit(new Discord.MessageEmbed({title: ":x: Erreur :x:", description: "Veuillez entrer un rôle correct", color: color.rouge}))
      }
    
  })
  
}

async function config_newUser_age_account(message, filter, guildConfig){
  if(guildConfig.premium === 1){
    // Si le serveur est bronze : ne lui proposer que d'activer ou désactiver la fonctionnalité
    if(guildConfig.bienvenue.account_age_require === 0){
      // si c'étais désactivé :
      message.edit(new Discord.MessageEmbed({title: "Activer l'ancienneté de compte ?", description: "**L'ancienneté de compte** permet de kick les personnes qui rejoignent le serveur dont le compte a été créé récemment pour éviter les comptes doubles, les spams...\nL'ancienneté requise est de **6 semaines** par défaut.", footer: "Activer cette option ne kickera aucune personnes actuellement sur le serveur.", color: color.vert}))
    } else {
      // si c'étais activé :
      message.edit(new Discord.MessageEmbed({title: "Désactiver l'ancienneté de compte ?", description: "**L'ancienneté de compte** permet de kick les personnes qui rejoignent le serveur dont le compte a été créé récemment pour éviter les comptes doubles, les spams...", color: color.rouge}))
    }
    ["✅", "❌"].forEach((r) => message.react(r));
    
    switch(await waitReaction(message, filter)){
      case "✅":
        if(guildConfig.bienvenue.account_age_require !== 0){
          message.channel.send("```Ancienneté de compte désactivée```");
          guildConfig.bienvenue.account_age_require = 0;
          mongodb.updateDoc(guildConfig, "guildsConfig", {
            id: message.guild.id,
          });
        } else {
          message.channel.send("```Ancienneté de compte activée```");
          guildConfig.bienvenue.account_age_require = 6;
          mongodb.updateDoc(guildConfig, "guildsConfig", {
            id: message.guild.id,
          });
        }
        break;
      
      default: 
        message.channel.send(":x: Annulation :x:");
        break;
    }

  } else if(guildConfig.premium === 2 || guildConfig.premium === 3){
    // si le serveur est premium alors fonctionnalté personnalisable
    message.edit(new Discord.MessageEmbed({title: "Modifier l'ancienneté de compte :", description: "**L'ancienneté de compte** permet de kick les personnes qui rejoignent le serveur dont le compte a été créé récemment pour éviter les comptes doubles, les spams...\nEntrez le nombre de semaines minimum avant la création du compte ou ``cancel`` pour annuler.", color: color.orange}))
    message.channel.awaitMessages((msg) => msg.member.permissions.has("AMINISTRATOR"),{ max: 1 }).then(collected => {
      var msg = collected.first();
      if(msg.content === "cancel"){
        message.channel.send(":x: Annulation :x:");
      } else {
        if(isNaN(parseInt(msg.content, 10))){
          // Nombre entré incorrect :
          message.edit(new Discord.MessageEmbed({title: "Oups, il y a un problème", description: ":x: Il semblerai que vous n'ayez pas entré un nombre correct. :confused: :x:", color: color.rouge}))
        } else {
          // nombre entré correct
          guildConfig.bienvenue.account_age_require = parseInt(msg.content);
          mongodb.updateDoc(guildConfig, "guildsConfig", {id: message.guild.id})
          message.edit(new Discord.MessageEmbed({title: `Ancienneté de compte minimum modifiée !`, description: `L'ancienneté de compte minimum a été modifié avec succès. Elle est désormais de **${parseInt(msg.content)} semaines minimum**.`, color: color.vert}))
        }
      }
    })
  }
}

async function config_newUser_captcha(message, filter, guildConfig){
  if(guildConfig.bienvenue.captcha === true){
    // Demander si l'utilisateur veut désactiver
    message.edit(new Discord.MessageEmbed({title: "Désactiver les captchas", description: "Vous êtes sur le point de désactiver les captchas, voulez-vous continuer ?\n\nLes captchas permettent de vérifier si le nouveau membre n'est pas un robot.", color: color.rouge}))
  } else if (guildConfig.bienvenue.captcha === false){
    //demander si l'utilisateur veut activer
    message.edit(new Discord.MessageEmbed({title: "Activer les captchas", description: "Vous êtes sur le point d'activer les captchas, voulez-vous continuer ?\n\nLes captchas permettent de vérifier si le nouveau membre n'est pas un robot.\n\nConseils d'utilisation :\nPour que les captchas puissent fonctionner, il faut définier un rôle automatique. Celui-ci sera attribué lorsque le captcha est vérifié.\nIl faut également que le rôle everyone ne puisse pas parler ou voir les channels. Le captcha est envoyé en message privé.", color: color.vert}))
  }
  ["✅", "❌"].forEach((r) => message.react(r));

  switch(await waitReaction(message, filter)){
    case "✅":
      if(guildConfig.bienvenue.captcha){
        // désactiver les captchas
        guildConfig.bienvenue.captcha = false;
        mongodb.updateDoc(guildConfig, "guildsConfig", { id: message.guild.id });
        message.edit(new Discord.MessageEmbed({title: "Captchas désactivés", color: color.rouge}))
      } else {
        // activer les captchas
        guildConfig.bienvenue.captcha = true;
        mongodb.updateDoc(guildConfig, "guildsConfig", { id: message.guild.id });
        message.edit(new Discord.MessageEmbed({title: "Captchas activés", color: color.vert}))
      }
      break;

    default: message.edit(new Discord.MessageEmbed({title: ":x: Annulation :x:", color: color.rouge})); break;
  }
  
}

/*
  *
  *
  * 
  * Fonctions fréquemments utilisées :
  *
  *
  * 
*/


function enable(condition) {
  if (condition === true) return "✅ Activé";
  else if(condition === false) return "❌ Désactivé";
  else if(condition === 0) return "❌ Désactivé";
  else return condition;
}

function premiumRequière(message, forfait, description) {
  var embed = new Discord.MessageEmbed()
    .setTitle(`Version __**${forfait}**__ requière`)
    .setDescription(
      `Pour ${description}, vous devez avoir la version **${forfait}**.`
    )
    .setColor("#e50000");
  message.edit(embed);
}

function forfait(premium) {
  switch (premium) {
    case 1:
      return ":third_place: **Bronze**";
    case 2:
      return ":second_place: **Silver**";
    case 3:
      return ":first_place: **__Gold__**";
    default:
      return "Oups, un problème est survenu, veuillez reset les paramètres du bot avec la conmmande ``!reset``";
  }
}

async function waitReaction(message, filter){
  var reaction;
  await message.awaitReactions(filter, {max: 1}).then((collected) => {
    reaction = collected.first().emoji.name;
    collected.first().users.remove(collected.first().users.cache.find(user => !user.bot));
  })
  return reaction;
}

function role(guildConfig){
  if(guildConfig.bienvenue.role === null){
    return enable(false);
  } else return `<@&${guildConfig.bienvenue.role}>`
}