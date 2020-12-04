const mongodb = require("../API/mongodb");
const Canvas = require("canvas");
const Discord = require("discord.js");
const config = require("../config.json");
const xp = require("../xp.json");

module.exports.run = async (client, message, args) => {
  const canvas = Canvas.createCanvas(1000, 300);
  const ctx = canvas.getContext("2d");

  const percent = 69;

  const guildConfig = await mongodb.get(
    { id: message.guild.id },
    config.mongodb.collection.guildsConfig
  );

  const user = await mongodb.getUser({
    id: message.author.id,
    guild: message.guild.id,
  });

  const nextLevel = xp.levels.filter((level) => level < user.xp).length;

  if (guildConfig)
    var background = await Canvas.loadImage(guildConfig.xp.background);
  else
    var background = await Canvas.loadImage(
      "https://nsm09.casimages.com/img/2020/06/11//20061112321725496416847262.png"
    );

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const avatar = await Canvas.loadImage(
    message.author.displayAvatarURL({ format: "jpg" })
  );

  ctx.save();
  ctx.beginPath();
  ctx.arc(63, 63, 50, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(avatar, 12, 12, 100, 100);

  ctx.restore();

  // Ecrire le nom de l'utilisateur
  ctx.font = "70px Trebuchet MS";
  ctx.fillStyle = "#fff";
  ctx.fillText(message.author.username, 114, 92);
  var largeur = ctx.measureText(message.author.username).width;

  // Ecrire le TAG de l'utilisateur
  ctx.font = "35px Trebuchet MS";
  ctx.fillStyle = "#B0B0B0";
  ctx.fillText(`#${message.author.discriminator}`, 114 + 3 + largeur, 92);

  // Barre d'XP
  ctx.lineWidth = 2.5;
  ctx.strokeRect(148, 208, 704, 39);

  ctx.fillStyle = "orange";
  ctx.fillRect(150, 210, percent * 7, 35);

  // Ecrire l'XP sur la progress bar
  ctx.fillStyle = "#B0B0B0";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(`${user.xp}/${xp.levels[nextLevel]}`, 852, 208);

  // Compiler & envoyer l'image
  const attachement = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "xp-image.png"
  );

  message.channel.send(attachement);
};

module.exports.help = {
  name: "xp",
  description: "Envoie votre score d'XP sur ce serveur",
  perm: null,
};
