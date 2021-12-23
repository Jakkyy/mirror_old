const Discord = require('discord.js');
const client = new Discord.Client();
const clientBot = new Discord.Client();
var tempClient = new Discord.Client();
const fetch = require('node-fetch');
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));

clientBot.on("ready", () => {
    console.log("Bot sbu ready");
    clientBot.user.setActivity("picchiare una tro.");

})

client.on("ready", async() => {

    console.log(`${client.user.username} ready`);

    data = await fetchData();
    categories = data[1];

    //first \ fetching (converting in array) all *TEXT* channels from *FOLDER_ID* in categories array (old_channels)
    old_channels = Array.from(client.channels.filter(channel => channel.type === "text" && categories.includes(channel.parentID)));

    setInterval(async() => {

        //calling fetchData function and retreiving categories_id
        data = await fetchData();
        categories = data[1];

        //fetching the channels every 500ms
        new_channels = Array.from(client.channels.filter(channel => channel.type === "text" && categories.includes(channel.parentID)));

        //if the lenght of the "static" lenght (old_channels) is different than the "dinamic" lenght (new_channels)(which changes every 500ms)
        if (new_channels.length != old_channels.length) {

            //if a channel is deleted from the category
            if (new_channels.length <= old_channels.length) {

                something = old_channels;
                //OLD CHANNELS + LUNGO
                //NEW CHANNELS + CORTO DOVE NON C'è CANALE ELIMINATO
                console.log(old_channels.length, new_channels.length);

                    
                //map of all the channels
                old_channels.map((channel, i) => {

                    new_channels.map((channel2, i2) => {

                        //check for each channel in old_channels if there's a same channel in new_channels
                        if (channel[1].id == channel2[1].id) {
                            //removing from something array the duplicated channels
                            something.splice(i, 1);
                        }
                    })
                })
                //in this way something contains only the channel to delete
                something = something.at(-1)[1];

                json = JSON.parse(await fs.readFileSync("webhooks.json", "utf8"));
                
                //fetching the json and searching for something row webhook and id
                const req = await fetch(json[something.id]);
                res = await req.json();

                //get the channel to remove using res.channel.id
                channel_to_remove = clientBot.channels.get(res.channel_id);

                try {
                    channel_to_remove.delete();
                } catch (err) {
                    //if channel is already deleted or something else
                    return console.log("Impossibile eliminare il canale")
                }

                //assigning to old_channels the new array (new_channels
                old_channels = new_channels;
                return console.log("tolto canale ")
            }

            //get info of the latest channel created (from new_channels array)
            let channel = client.channels.get(new_channels.at(-1)[1].id);

            //create a new channel in a category
            createChannel(channel);

            //changing old_channels to the new_channels variable
            old_channels = new_channels;

            console.log("detecte changes, new lenght " + old_channels.length);
        }
    }, 500);
})

client.on("message", async(message) => {

    if (message.guild.id != "919634483861401631" || !message.guild.id) return;

    //calling fetchData function and retreiving guild_id
    data = await fetchData();
    guild_id = data[0];

    if (guild_id.includes(message.guild.id)) {
        json = JSON.parse(await fs.readFileSync("webhooks.json", "utf8"));
        if (json[message.channel.id])
            sendWebhook(message, json[message.channel.id]);
    }
})

clientBot.on("message", (message) => {

    if (message.author.bot) return;
    if (!clientBot) return;

    const args = message.content.trim().split(/ +/g);

    if (message.content.startsWith(`${settings.prefix}setup`)) {

        /*
        token = args[1].replace('"', "");

        const req = await fetch("https://discord.com/api/v9/users/@me", {
            "headers": {
                "accept": "*",
                "accept-language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
                "authorization": "NjIxNDYwNDQ3MzU0MjkwMTg2.Ya6I7g.2OmTh8DBA8LsnQ4WEW2ItwVYHDY",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-debug-options": "bugReporterEnabled",
                "x-discord-locale": "it",
                "x-super-properties": "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6Iml0LUlUIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzk2LjAuNDY2NC4xMTAgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6Ijk2LjAuNDY2NC4xMTAiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTA4OTI0LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ=="
            },
            "referrer": "https://discord.com/login",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        let res = await req.json();

        console.log("ciao")
        if (res.message == '401: Unauthorized') return message.channel.send("Token non valido");
        */



        //temp_client.login("NjA4MDc0NjcxNjI3MzA0OTgw.YPYEYg.J1n4CVcpU6WMrlLtRUFk9MzzD9k");


        obj = new Array();
        guild_id_arr = new Array();

        tempClient.guilds.map(guild => {
            obj.push(`${guild.name} **-->** ${guild.id}`);
            guild_id_arr.push(guild.id)
        });

        if (parseInt(obj.join("").length / 2048) > 0) {
            obj = obj.join("\n").substring(0, 2047);
        }

        const embed = new Discord.RichEmbed()
            .setColor("#ff004c")
            .setTitle("Fetched guilds:")
            .setDescription(obj)
        message.channel.send(embed);


        id_to_change = "917792875700432917"
        current_guild = tempClient.guilds.get(id_to_change);

        //message.channel.send("Choosed -> " + current_guild.name + "\nId -> " + current_guild.id)

        category_object = new Array();
        categories = tempClient.channels.filter(channel => channel.type === "category" && channel.guild.id == id_to_change).forEach(category => {

            category_object.push(`${category.name} **-->** ${category.id}`);
        });

        message.channel.send(category_object)
    }
})

function createChannel(channel_main) {

    var server = clientBot.guilds.get(settings.master_server);

    if (clientBot) {
        server.createChannel(channel_main.name, {
            type: "text",
            /// DA CAMBIARE
            /// DA CAMBIARE
            /// DA CAMBIARE
            /// DA CAMBIARE
            /// DA CAMBIARE
            /// DA CAMBIARE
            /// DA CAMBIARE
            /// DA CAMBIARE
            parent: "919634484301815849"
        }).then(async channel => {
            channel.createWebhook("Captain schettino").then(async webhook => {
                webhook.send("Nuovo canale creato");

                json = (await fs.readFileSync("webhooks.json", "utf8"));

                channel_id = channel_main.id;

                fs.readFile('webhooks.json', 'utf8', function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {

                        obj = JSON.parse(data); //now it an object

                        //console.log(obj)
                        obj[channel_id] = webhook.url;

                        fs.writeFileSync('webhooks.json', JSON.stringify(obj, null, 4), 'utf8');
                    }
                });
            });
        })
    }
}

async function sendWebhook(message, hook) {

    content = message.content;

    message.member ? highest = message.member.highestRole.name : highest = "No role";

    if (message.embeds.length > 0) {

        embed = message.embeds[0];

        var arr = new Array();
        embed.fields.forEach(field => {
            obj = {
                "name": field.name,
                "value": field.value,
                "inline": field.inline
            }
            arr.push(obj);
        })


        if (embed.author) {
            author_obj = {
                name: embed.author.name,
                url: embed.author.url,
                icon_url: embed.author.iconURL
            }
        } else {
            author_obj = {
                name: undefined,
                icon_url: undefined,
                url: undefined
            }
        }
        if (embed.thumbnail) {
            thumbnail_obj = {
                url: embed.thumbnail.url
            }
        } else {
            thumbnail_obj = {
                url: undefined
            }
        }
        if (embed.footer) {
            footer_obj = {
                text: embed.footer.text,
                icon_url: embed.footer.iconURL
            }
        } else {
            footer_obj = {
                text: undefined,
                icon_url: undefined
            }
        }
        if (embed.image) {
            image_obj = {
                url: embed.image.url
            }
        } else {
            image_obj = {
                url: undefined,
            }
        }

        var params = {
            username: `${message.author.username} | ${highest}`,
            avatar_url: message.author.avatarURL,
            embeds: [{
                "title": embed.title,
                "color": embed.color,
                "description": embed.description,
                "timestamp": embed.timestamp,
                "author": author_obj,
                "thumbnail": thumbnail_obj,
                "footer": footer_obj,
                "video": embed.video,
                "fields": arr,
                "image": image_obj,
                "url": embed.url
            }],
        }
    } else {

        var params = {
            username: `${message.author.username} | ${highest}`,
            avatar_url: message.author.avatarURL,
            content: content,
        }

    }


    if (message.attachments.size > 0) {
        //console.log(message.attachments);

        images = message.attachments.map(image => {
            return image;
        })

        console.log(images[0])

    }


    const req = await fetch(hook, {
        method: "POST",
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(params)
    })


    try {
        res = await req.json();

        errors = res.errors.embeds[0];
        console.log("ERRORE")
        console.log(errors);

    } catch (err) {}

}

async function fetchData() {
    const file = JSON.parse(fs.readFileSync("settings.json", "utf8")).guilds;
    let guild_id = new Array();
    let categories_id = new Array();

    file.forEach(guild => {
        guild_id.push(guild.guild_id);
        guild.categories.forEach(category => {
            categories_id.push(category.id);
        })
    });

    return [guild_id, categories_id];

}

tempClient.login("mfa.jVXE2ZjR2ODp7hDtGIY_VsN9MTfW_mXicsxhe9xNc8T-UF4OMWnzHV55MJatRm0wkgo0v409jUHBRu2IBona");

function loginTempToken(token) {
    tempClient.login(token);
    return tempClient;
}

client.login("NjA4MDc0NjcxNjI3MzA0OTgw.YPYEYg.J1n4CVcpU6WMrlLtRUFk9MzzD9k");
clientBot.login("OTIyOTA2ODk5MDM5NTE4NzIw.YcISBw.QcpE1lkrJ_TAF2kqv3webJAFyE8")
