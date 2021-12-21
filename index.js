const Discord = require('discord.js');
const client = new Discord.Client();
const fetch = require('node-fetch');
const fs = require('fs');
var json;

const tokens = [
    "NzcwNzg3Nzk5Nzc0MjY1MzU0.YJ-fuw.7PPUm_GqL1UMi-FgkXQjIQyfhRA",
    "Nzc2Mzk0MTYyNjQzNDAyNzUy.YJb_QA.fe4ELei8DBBAGzGusyN1cx46Hww",
    "NjA4MDc0NjcxNjI3MzA0OTgw.YPYEYg.J1n4CVcpU6WMrlLtRUFk9MzzD9k"
]

const guild_id = [
    "490903807648071690",
    "833430744802000978",
    "496020627191496705",
    "919634483861401631" //test server
]

const pings_role = [
    "<@&917557951491870871>",
    "<@&918868871656640542>",
    "<@&919515159142223872>"
]


const categories = [
    "895378141063811092", //nft info | cc
    "838112076794036264", //nft plays | cc 
    "880381981798572092", //bnft | best notify
    "882171466832044072" //nft | hypehunters
]

client.on("ready", async() => {
    console.log("ready");
    json = JSON.parse(await fs.readFileSync("webhooks.json", "utf8"));
})

tokens.map((token, i) => {

    const client = new Discord.Client();
    client.login(token);

    client.on("ready", async() => {
        console.log(`${client.user.username} ready`);
        json = JSON.parse(await fs.readFileSync("webhooks.json", "utf8"));
    })



    client.on("message", (message) => {

        try {
            if (!message.guild.id) return;
        } catch (e) {
            return;
        }


        if (guild_id.includes(message.guild.id)) {
            if (json[message.channel.id])
                sendWebhook(message, json[message.channel.id]);
        }
    })
})

function sendWebhook(message, hook) {

    content = message.content;

    message.member ? highest = message.member.highestRole.name : highest = "No role";

    var params = {
        username: `${message.author.username} | ${highest}`,
        avatar_url: message.author.avatarURL,
        content: content,
        attachments: message.attachments,
    }

    fetch(hook, {
        method: "POST",
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(params)
    }).catch(err => {
        console.error(err);
    })
}

//client.login("mfa.Ez0oLndz9p49tqkCHQthRHHw-k18gXS7tzTGqStD6kQ2dLCStuBQJadrxuN8gFsDvsDpEEtT2hru8ay-dIzS")