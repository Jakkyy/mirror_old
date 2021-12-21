const Discord = require('discord.js');
const client = new Discord.Client();
const clientBot = new Discord.Client();
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

    //first \ fetching (converting in array) all *TEXT* channels from *FOLDER_ID* in categories array
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


                old_channels.map((channel, i) => {

                    new_channels.map((channel2, i2) => {

                        if (channel[1].id == channel2[1].id) {
                            something.splice(i, 1);
                        }
                    })
                })

                something = something.at(-1)[1];

                json = JSON.parse(await fs.readFileSync("webhooks.json", "utf8"));

                const req = await fetch(json[something.id]);

                res = await req.json();

                channel_to_remove = clientBot.channels.get(res.channel_id);


                try {
                    channel_to_remove.delete();
                } catch (err) {
                    return console.log("Impossibile eliminare il canale")
                }

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
            parent: "919633032661569557"
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

                        console.log(obj)
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

client.login("NjA4MDc0NjcxNjI3MzA0OTgw.YPYEYg.J1n4CVcpU6WMrlLtRUFk9MzzD9k");
clientBot.login("OTIyOTA2ODk5MDM5NTE4NzIw.YcISBw.QcpE1lkrJ_TAF2kqv3webJAFyE8")