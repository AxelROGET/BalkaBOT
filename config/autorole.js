const { ObjectId } = require("mongodb");
const { guildsConfig, reactRole } = require("../API/mongoose");
const { client } = require("../events/ready");

module.exports = (req, res) => {
  console.log(req.body)
  if(req.body.action === "add") add(req, res);
  else if(req.body.action === "remove") remove(req, res);
}

async function add(req, res) {
  const {message, messageContent, reaction, role, token, guild} = req.body
  const guildConfig = await guildsConfig.findOne({_id: new ObjectId(token), id: guild})

  reactRole.create({
    guild: guild,
    message: message,
    reaction: reaction,
    role: role,
    messageContent: messageContent,
    roleName: client.guilds.cache.get(guild).roles.cache.get(role).name,
  }).then(result => res.sendStatus(200))

}

function remove(req, res) {
  const {token, guild} = req.body;
  reactRole.findOneAndDelete({_id: new ObjectId(token), guild: guild}).then(result => res.sendStatus(200))
}