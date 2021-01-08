const Discord = require('discord.js');
module.exports = {
    name: "restart",
    description: "This command will restart the bot!",
    execute(message, ALTProccessOBJ){
        function BoldEmbed(Message){
            let Embed = new Discord.MessageEmbed()
            Embed.setColor('#0099ff')
            Embed.setTitle(Message)
            message.channel.send(Embed);
        }

        if(Object.keys(ALTProccessOBJ).indexOf(message.channel.id) == -1){
            BoldEmbed("⚠ No AFKing Alt is linked with this channel ⚠");
        }
        else{
            ALTProccessOBJ[message.channel.id].kill();
            BoldEmbed("Restarting ALT")
        }

        // let found = false;
        // CCObjects.forEach(element => {
        //     if(message.channel.id == element.discordID){
        //         found = true;
        //         BoldEmbed(`Restarting: ${element.username}`)
        //         element.bot.end();
        //     }
        // })
        // if(!found){
        //     BoldEmbed(`⚠ No AFKing alt is linked with this channel ⚠`)
        // }
    message.delete();
    }
}