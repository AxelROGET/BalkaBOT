const mongoose = require("mongoose");
const { login, password, dbName, collection } = require("../config.json").mongodb;
const url = `mongodb+srv://${login}:${password}@cluster0.4rslv.mongodb.net/${dbName}?retryWrites=true&w=majority`;
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

const guildConfigSchema = mongoose.Schema({
  id: String, 
  xp: {
    enable: {type: Boolean, default: false},
    background: {type: String, default: "https://nsm09.casimages.com/img/2020/06/11//20061112321725496416847262.png"},
    combos: {type: Boolean, default: false},
    flammes: {type: Boolean, default: false},
    multiplicateur: {type: Number, default: 1},
  },
  raid_protection: {type: Boolean, default: false},
  bienvenue: {
    message: {
      title: {type: String, default: "Nouveau member !"},
      description: {type: String, default: "{member} a rejoint le serveur, invité par {inviter} !"},
    },
    role: {type: String, default: null},
    account_age_require: {type: Number, default: 0},
    captcha: {type: Boolean, default: false},
  },
  tickets: {type: Boolean, default: false},
  voice_manager: {type: Boolean, default: false},
  premium: {type: Number, default: 1},
})

const reactRoleSchema = mongoose.Schema({
  guild: String,
  message: String, 
  reaction: {type: String, default: "👍"}, 
  role: String,
  messageContent: String,
  roleName: String,
});

module.exports.guildsConfig = mongoose.model("guildsConfig", guildConfigSchema, "guildsConfig");
module.exports.reactRole = mongoose.model("reactRole", reactRoleSchema);