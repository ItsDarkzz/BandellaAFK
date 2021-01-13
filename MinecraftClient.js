const mineflayer = require('mineflayer');
const fs = require("fs")

var chat = false;
var lastchat = Date.now();
var ChatBuffer = [];


var Settings;
try{
  const settingsdata = fs.readFileSync("./settings.json");
  Settings = JSON.parse(settingsdata);
  console.log("Settings File Loaded");
}catch(err) {
  console.error(err)
  process.exit(1);
};

var options = {
  host: Settings.host,
  username: process.argv[2],
  password: process.argv[3],
  auth: process.argv[4],
  version: Settings.version,
  
}

var host;
if(options.host.toLowerCase().indexOf("cosmic") != -1){
  host = "cosmic"
}
else if(options.host.toLowerCase().indexOf("vanity") != -1){
  host = "vanity"
}
else if(options.host.toLowerCase().indexOf("archon") != -1){
  host = "archon"
}
else{
  if(Settings.BankBot){
    process.send && process.send({embed: `The BankBot doesn't seem to be support ${options.host} yet open up a ticket to get support`})
    Settings.BankBot = false;
  }

}

var MCBOT = new mineflayer.createBot(options);

MCBOT.on("kicked", (reason) =>{
  reason = JSON.parse(reason)
  if(reason.text == Settings.Already_logged_in_msg){
    process.send && process.send({embed: `${MCBOT.username} Seems to already be logged in. %relog to try again`, relog: false});
    console.log(`${MCBOT.username} Seems to already be logged in. %relog to try again`);
  }
})

MCBOT.on("end", () =>{
  process.send && process.send({relog: true})
})

MCBOT.on("chat", (username, message, translate, jsonMsg, matches) =>{
  lastchat = Date.now();
  let longmsg = "";
  jsonMsg.extra.forEach(elem => {
    longmsg += elem.text;
  })
  let longmsgarray = longmsg.split("");
  while(longmsgarray.indexOf("§") != -1){
    longmsgarray.splice(longmsgarray.indexOf("§"), 2);
  }
  longmsg = longmsgarray.join("");
  if(chat){
    process.send({text: longmsg});
  }
  if(Settings.BankBot){
    if(longmsg.startsWith("$") && longmsg.indexOf("has been received from") != -1){
      longmsg = longmsg.split(" ");
      let name;
      if(host == "archon"){
        name = longmsg[5].replace(".", "");
      }
      else{
        name = longmsg[6].replace(".", "");
      }
      process.send && process.send({embed: `${name} has deposited ${longmsg[0]}`})
    }
  }

})

MCBOT.on("spawn", () =>{
  ChatBuffer.push(Settings.hub_command)
})
  
MCBOT.on("login", () =>{
  process.send && process.send({embed:`${MCBOT.username} has successfully logged in!`});
  console.log(`${MCBOT.username} has successfully logged in!`)
})
  
MCBOT.on("death", () =>{
  ChatBuffer.push("/home afk")
})

MCBOT.on('error', (err) =>{
  if(err.toString().startsWith("Error: Invalid credentials. Invalid username or password.")){
    console.log("Invalid credentials. Invalid username or password")
    process.send && process.send({relog: false, embed: "Wrong username and password %remove this alt or to try again %relog"})
  }
  else{
    console.log(err)
    process.send && process.send({relog: true, embed: `${MCBOT.username} has crashed and is being reloged`})
  }
  
})

process.on("message", (data) =>{
  try{
    let keys = Object.keys(data)
    if(keys.includes("chat")){
      if(data.chat == "true"){
        chat = true
      }
      else if(data.chat == "false"){
        chat = false;
      }
    }
    else if(keys.includes("message")){
      ChatBuffer.push(data.message);
    }
  }catch(err){console.error(err)}
})


setInterval(() => {
  if(ChatBuffer.length != 0){
    let msg = ChatBuffer.shift();
    MCBOT.chat(msg);
  }
}, 2000);

setInterval(() => {
  ChatBuffer.push(Settings.hub_command)
  ChatBuffer.push(Settings.anti_afk_command)
  ChatBuffer.push("/home afk");
}, 300000)

setInterval(() => {
  if(Date.now() - lastchat > Settings.Chat_anti_AFK_delay * 1000 && Settings.Chat_anti_AFK){
    console.log("No chat msg recived in 5 mins restarting the bot")
    process.send && process.send({embed: `No chat msg recived in ${Settings.Chat_anti_AFK_delay / 60} mins restarting the bot`, relog: true });
  }
}, 30000)