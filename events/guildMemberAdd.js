const { MessageEmbed } = require("discord.js");
const mongodb = require("../API/mongodb");
const config = require("../config.json");

module.exports = async (client, member) => {

  var guildConfig = await mongodb.get({ id: member.guild.id }, "guildsConfig");

  /* 
    1ère étape : 
    Vérification de l'âge du compte. 

    SI le compte est plus récent que le nombre de semaines indiqué dans guildConfig, 
    kick le nouveau membre après lui avoir envoyé un message.

    Attention ! Ne kick uniquement si le bot a la permission
  */

  if (guildConfig.bienvenue.account_age_require !== 0 && member.kickable) {
    const age_account = parseInt(
      (Date.now() - member.user.createdTimestamp) / 6.048e8
    );
    if (age_account < guildConfig.bienvenue.account_age_require) {
      // si le compte de l'utilisateur est trop récent :
      member
        .send(
          new MessageEmbed({
            title: "Vous ne pouvez pas rejoindre ce serveur.",
            description: `Votre compte est malheuresement trop récent pour rejoindre ce serveur.\nVotre compte n'a que **${age_account} semaine(s)** et le serveur en demande ${guildConfig.bienvenue.account_age_require} minimum :confused:`,
            color: config.color.rouge,
          })
        )
        .then((msg) => {
          member.kick("Compte trop récent");
          return;
        });
      return;
    }
  }

  /* 
    2ème étape : 
    Captcha

    Vérifier si dans les paramètres de serveur le captcha est activé ou non. 
    S'il est activé, envoyer un message au nouveau membre et attendre une réaction pour passer à la suite.
  */
  const captcha = await checkCaptcha(client, member, guildConfig);

  /*
    3ème étape : annonce de l'arrivé dans le premier channel du serveur.
 */
  if (captcha) annonce(client, member, guildConfig);

  /* 
    4ème étape : rôle automatique 
    Lorsque le captcha est vérifié et s'il y a un rôle automatique dans les paramètres, 
    ajouter ce rôle au membre.
  */
  if (captcha && guildConfig.bienvenue.role !== null) {
    member.roles
      .add(guildConfig.bienvenue.role)
      .catch(console.error("impossible d'effectuer cette action"));
  }
};
async function checkCaptcha(client, member, guildConfig) {
  var result;
  if (guildConfig.bienvenue.captcha) {
    // si le serveur demande un captcha :
    await member
      .send(
        new MessageEmbed({
          title: "Vérification humaine :",
          description: `Bienvenue sur le serveur ${member.user} !\nNous avons besoin de savoir à quel point vous êtes inhumain :thinking:\nJe vous rassure le test n'est pas compliqué : il suffit juste de cliquer sur la réaction juste en dessous.\n:arrow_double_down: `,
          color: config.color.orange,
        })
      )
      .then(async (msg) => {
        msg.react("🆗");
        await msg
          .awaitReactions(
            (reaction, user) =>
              reaction.emoji.name === "🆗" && client.user.id !== user.id,
            { max: 1 }
          )
          .then((collected) => {
            result = true;
          });
      });
  } else result = true;

  return result;
}

async function annonce(client, member, guildConfig) {
  const ready = require("./ready");

  const inviteCreate = require("./inviteCreate");

  var guildInvites;

  if (inviteCreate.invites) {
    guildInvites = inviteCreate.invites;
  } else {
    guildInvites = ready.invites;
  }

  const cachedInvites = guildInvites.get(member.guild.id);
  const newInvites = await member.guild.fetchInvites();
  guildInvites.set(member.guild.id, newInvites);
  const usedInvite = newInvites.find(
    (inv) => cachedInvites.get(inv.code).uses < inv.uses
  );

  var embed = new MessageEmbed()
    .setAuthor(member.user.username, member.user.avatarURL())
    .setDescription(
      replace(guildConfig.bienvenue.message.description, member, usedInvite)
    )
    .setColor(config.color.vert)
    .setTitle(replace(guildConfig.bienvenue.message.title, member, usedInvite));
  member.guild.channels.cache.array()[0].send(embed);
}
function replace(string, member, usedInvite) {
  const words = [
    { old: "{member}", new: member.user },
    { old: "{inviter}", new: usedInvite.inviter },
    { old: "{counter}", new: "12" },
    { old: "{link}", new: usedInvite.code },
  ];

  words.forEach((word) => (string = string.replace(word.old, word.new)));
  return string;
}
