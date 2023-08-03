require('dotenv').config();
// const keepAlive = require('./server');
const mongo = require('./mongo');
const scSchema = require('../schemas/sc');
const modSchema = require('../schemas/mod');
const { Client, GatewayIntentBits, EmbedBuilder, PermissionBitField, Permissions, time } = require('discord.js');
const { MessageActionRow, MessageButton, ActionRowBuilder } = require('discord.js');
const { ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const timestamps = [
    // this contains timestamps of week July 10th - July 17th
    { time: '1688947200', name: 'Numbspliff' },
    { time: '1688976000', name: 'Yuki' },
    { time: '1689015600', name: 'Wake' },
    { time: '1689033600', name: 'Kami' },
    { time: '1689066000', name: 'Matty' },
    { time: '1689105600', name: 'Saeko' },
    { time: '1689120000', name: 'Kami' },
    { time: '1689148800', name: 'CoolGuy' },
    { time: '1689177600', name: 'Prem' },
    { time: '1689206400', name: 'Kami' },
    { time: '1689238800', name: 'Jordy' },
    { time: '1689278400', name: 'Numbspliff' },
    { time: '1689300000', name: 'Yuki' },
    { time: '1689328800', name: 'Dpitty' },
    { time: '1689361200', name: 'Wake' },
    { time: '1689379200', name: 'Matty' },
    { time: '1689418800', name: 'Calllight' },
    { time: '1689451200', name: 'Saeko' },
    { time: '1689469200', name: 'Jordy' },
    { time: '1689501600', name: 'Harlow' },
    { time: '1689523200', name: 'Prem' },
    // next week
    { time: '1689552000', name: 'Numbspliff' },
    { time: '1689580800', name: 'Yuki' },
    { time: '1689620400', name: 'Wake' },
    { time: '1689638400', name: 'Kami' },
    { time: '1689670800', name: 'Matty' },
    { time: '1689710400', name: 'Saeko' },
    { time: '1689724800', name: 'Kami' },
    { time: '1689753600', name: 'CoolGuy' },
    { time: '1689782400', name: 'Prem' },
    { time: '1689811200', name: 'Kami' },
    { time: '1689843600', name: 'Jordy' },
    { time: '1689883200', name: 'Numbspliff' },
    { time: '1689904800', name: 'Yuki' },
    { time: '1689933600', name: 'Dpitty' },
    { time: '1689966000', name: 'Wake' },
    { time: '1689984000', name: 'Matty' },
    { time: '1690023600', name: 'Calllight' },
    { time: '1690056000', name: 'Saeko' },
    { time: '1690074000', name: 'Jordy' },
    { time: '1690106400', name: 'Harlow' },
    { time: '1690128000', name: 'Prem' }
];

function getNextThreeEvents() {
    let weeksPassed=((Math.floor(Date.now() / 3600000)*3600) - timestamps[0].time)/(7 * 24 * 60 * 60);
    console.log(Math.floor(Date.now() / 3600000)*3600)
    for (const event of timestamps) {
        event.time = Number(event.time) + (7 * 24 * 60 * 60 * Math.floor(weeksPassed));
      }
      const nextEvents = timestamps.filter((event) => Number(event.time) > Math.floor(Date.now() /1000));
const nextThreeEvents = nextEvents.slice(0, 3);
    return nextThreeEvents;
  }


let modders = []
let joiners = []
let host
let heistThreadId;
let heistWebHook;

async function start() {
    try {
        const mongoose = await mongo();
        console.log('Connected to MongoDB vi');
        // keepAlive()
        const mySecret = process.env.TOKEN
        client.login(process.env.TOKEN)

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
start();

async function updateModders() {
    try {
        const modderDocs = await modSchema.find({}, 'discordId');
        modders = modderDocs.map((modder) => modder.discordId);
    } catch (error) {
        console.error('Error retrieving modders:', error);
    }
}
updateModders()

async function getsc(discordId) {
    try {
        const doc = await scSchema.findOne({ discordId });
        if (doc) {
            const scUsername = doc.scUsername;
            return scUsername
        } else {
            return null
        }
    } catch (error) {
        return null
    }
}

client.on("ready", (x) => {
    console.log(`${x.user.tag} is ready!`)
    client.user.setActivity(`Doing Heists`);

    const ping = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('This is a ping command');

    client.application.commands.create(ping);
});

client.on("messageCreate", async (message) => {
    if (message.content.startsWith('!editThumbnail') && message.author.id === '428902961847205899') {
        const repliedMessage = message.reference?.messageId
          ? await message.channel.messages.fetch(message.reference.messageId)
          : null;
        const existingEmbed = repliedMessage.embeds[0];
        if (!existingEmbed) {
          return message.reply('The replied message does not have an embed!');
        }
        console.log(existingEmbed)
        existingEmbed.data.thumbnail = {
            width :128,
            height :128,
            proxy_url: `https://images-ext-1.discordapp.net/external/zlAX06vJk-mshkAc7haIpAahfrlhPn3-A1uQS2ivn2U/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/853523258939015169/a_6d21a723a5ee3e402968fd21b5868815.gif`,
            url: 'https://cdn.discordapp.com/avatars/853523258939015169/a_6d21a723a5ee3e402968fd21b5868815.gif?size=1024', 
        };
        repliedMessage.edit({
          embeds: [existingEmbed],
        });
        return ;
      }
    if (message.content === '??nextheists') {
        const nextThreeEvents = getNextThreeEvents();

        if (nextThreeEvents.length === 0) {
            message.channel.send('No upcoming events.');
            return;
        }
        // console.log(nextThreeEvents)
        const embed = new EmbedBuilder()
            .setTitle('Next Three heists')
            .setColor('#FF5733')
            .addFields(
                { name: nextThreeEvents[0].name, value: `<t:${nextThreeEvents[0].time}:R>` },
                { name: '\u200B', value: '\u200B' },
                { name: nextThreeEvents[1].name, value: `<t:${nextThreeEvents[1].time}:R>` },
                { name: '\u200B', value: '\u200B' },
                { name: nextThreeEvents[2].name, value: `<t:${nextThreeEvents[2].time}:R>` },
                { name: '\u200B', value: '\u200B' },
            )

        message.channel.send({ embeds: [embed] });
    }
    if (message.content.startsWith("??cloneherefrom") && message.author.id === '428902961847205899') {
        const { channel, content } = message
        let text = content.slice(16);
        const sourcee = text;
        if (client.channels.cache.get(sourcee)) {
            const arr = [];
            var i = 0;
            var temp = 11;
            var fetched = await client.channels.cache.get(sourcee).messages.fetch({ limit: 100 });
            fetched.forEach(element => {
                arr[i] = element;
                i++;
            });

            temp = fetched.last().id;
            while (1) {
                fetched = await client.channels.cache.get(sourcee).messages.fetch({
                    limit: 100,
                    before: temp,
                });
                fetched.forEach(element => {
                    arr[i] = element;
                    i++;
                });
                if (fetched.last()) {
                    channel.send(i)
                        .then(msg => {
                            msg.delete({ timeout: 2000 });
                        })
                        .catch(err => console.error(err))
                    temp = fetched.last().id;
                } else {
                    // console.log(i)
                    // channel.send(i)
                    //     .then(msg => {
                    //         msg.delete({ timeout: 2000 });
                    //     })
                    //     .catch(err => console.error(err))
                    break;
                }
            }

            const webhooks1 = await channel.fetchWebhooks();
            let found1 = webhooks1.find(element => element.name.toLocaleLowerCase('en-US') === `dash`);
            if (found1) {
                found1 = found1;
            } else {
                await message.channel.createWebhook({
                    name: 'dash',
                    avatar: 'https://media.istockphoto.com/id/1127235507/video/circular-interface-hud-design-infographic-elements-like-music-equalizer-audio-waves-or-sound.jpg?s=640x640&k=20&c=Fz18UW2MpatgZlYbUDy6OX9fEZjuuwfedKCfcjWrbEQ='
                })
                    .then(async webhook => {
                        console.log(`Created webhook ${webhook}`);
                        found1 = await webhook;
                    })
                    .catch(console.error);
            }
            for (var i = arr.length - 1; i >= 0; i--) {
                var abc = 0;

                if (arr[i].embeds) {
                    // console.log(arr[i].components.a)

                    arr[i].embeds.forEach(emb => {
                        // console.log(emb.type)
                        // if (emb.type === `rich`) {
                        abc++;
                        found1.send({
                            username: arr[i].author.username,
                            avatarURL: arr[i].author.displayAvatarURL({ format: 'png' }),
                            embeds: [emb],
                            // components : [arr[i].components]
                        })
                        // }
                    })
                }

                if (arr[i].attachments.size > 0) {
                    console.log()
                    arr[i].attachments.forEach(Attachment => {
                        abc++;
                        found1.send({
                            embeds: [emb],
                            content: Attachment.url,
                            username: arr[i].author.username,
                            avatarURL: arr[i].author.displayAvatarURL({ format: 'png' }),
                        })
                    })
                }

                if (arr[i].content) {
                    abc++;
                    found1.send({
                        content: arr[i].content,
                        username: arr[i].author.username,
                        avatarURL: arr[i].author.displayAvatarURL({ format: 'png' }),
                    })
                }

                if (!abc) {

                    found1.send({
                        content: `https://discord.com/channels/${arr[i].channel.guild.id}/${arr[i].channel.id}/${arr[i].id}`,
                        username: arr[i].author.username,
                        avatarURL: arr[i].author.displayAvatarURL({ format: 'png' }),
                    })
                    // channel.send(`https://discord.com/channels/${arr[i].channel.guild.id}/${arr[i].channel.id}/${arr[i].id}`);
                }
            }
            found1.send({
                content: `CLoned ${arr.length} messages successfully ~~hope so~~`,
            })
            found1.send({
                content: `Time taken : ${Date.now() - message.createdTimestamp}ms`,
            })
            console.log(Date.now())
            console.log(message.createdTimestamp)
            console.log(message.content)
            message.author.send(`CLoning ${arr.length} messages in <#${message.channel.id}>`)
            client.users.fetch('428902961847205899', false).then((user) => {
                user.send(`Cloning ${arr.length} messages in <#${message.channel.id}>.\nAction initiated by ${message.author.tag}`);
            });
        } else {
            channel.send('Please provide a valid channel ID');
        }
    };
    if (message.content.startsWith('??addmodder') && (message.author.id === '330632487812202498' || message.author.id === '428902961847205899')) {
        const args = message.content.split(' ');
        if (args.length !== 2) {
            return message.reply('Invalid command format. Please provide a valid Discord ID.');
        }


        let discordId
        if (args.length > 1) {
            const mention = message.mentions.users.first();
            if (mention) {
                discordId = mention.id;
            } else {
                discordId = args[1];
            }
        }
        // const discordId = args[1];

        try {
            const existingModder = await modSchema.findOne({ discordId });

            if (existingModder) {
                return message.reply('The modder is already in the database.');
            }

            // Fetch the username of the modder
            let user = await client.users.fetch(discordId);
            let discordUsername = user.username;

            // Create a new modder entry
            const newModder = new modSchema({ discordId, discordUsername });
            await newModder.save();

            message.reply(`Modder with ID ${discordId} has been added to the database.`);

            updateModders()
            console.log(modders)
        } catch (error) {
            console.error('Error adding modder:', error);
            message.reply('An error occurred while adding the modder.');
        }
    }

    if (message.content.startsWith('??removemodder') && (message.author.id === '330632487812202498' || message.author.id === '428902961847205899')) {
        const args = message.content.split(' ');
        if (args.length !== 2) {
            return message.reply('Invalid command format. Please provide a valid Discord ID.');
        }


        let discordId
        if (args.length > 1) {
            const mention = message.mentions.users.first();
            if (mention) {
                discordId = mention.id;
            } else {
                discordId = args[1];
            }
        }
        // const discordId = args[1];

        try {
            const existingModder = await modSchema.findOne({ discordId });

            if (!existingModder) {
                message.reply('The modder does not exist in the database.');
            }
            else {
                await modSchema.findOneAndDelete({ discordId });

                message.reply(`Modder with ID ${discordId} has been removed from the database.`);



                updateModders()
                console.log(modders)
            }
        } catch (error) {
            console.error('Error removing modder:', error);
            message.reply('An error occurred while removing the modder.');
        }
    }


    // Command to retrieve modders and update the array
    if (message.content.toLowerCase() === '??getmodders') {
        try {
            const modderDocs = await modSchema.find({}, 'discordId');
            modders = modderDocs.map((modder) => modder.discordId);

            if (modders.length > 0) {

                const modderList = modders.map((modder) => `${modder}         \t- \t<@${modder}>`).join('\n');

                const embed = new EmbedBuilder()
                    .setColor('#8AC7DB')
                    .setTitle('Modders Discord IDs')
                    .setDescription(modderList);

                message.channel.send({ embeds: [embed] });
                //   (`Modders Discord IDs: ${modderList}`, "allowedMentions": { "parse" : []});


                updateModders()
                console.log(modders)
            } else {
                message.channel.send('No modders found in the database.');
            }
        } catch (error) {
            console.error('Error retrieving modders:', error);
            message.channel.send('An error occurred while retrieving modders.');
        }
    }


    if (message.content.toLowerCase().startsWith("??getsc")) {
        const args = message.content.split(" ");
        let targetId = message.author.id;

        if (args.length > 1) {
            const mention = message.mentions.users.first();
            if (mention) {
                targetId = mention.id;
            } else {
                targetId = args[1];
            }
        }

        try {
            const doc = await scSchema.findOne({ discordId: targetId });

            if (doc) {
                const scUsername = doc.scUsername;
                message.channel.send(`Social Club username: ${scUsername}`);
            } else {
                message.channel.send("Social Club username not found.");
            }
        } catch (error) {
            console.error("Error retrieving Social Club username:", error);
            message.channel.send("An error occurred while retrieving the Social Club username.");
        }
    }

    if (message.content.toLowerCase() === "??sc" && modders.includes(message.author.id)) {
        message.delete();
        const scEmbed = new EmbedBuilder()
            .setColor('#8AC7DB')
            .setTimestamp()
            .setTitle(`Social Club`)
            .setDescription(`Set your social club username`);
        const scRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('setsc')
                    .setEmoji('🔆')
                    .setStyle(ButtonStyle.Secondary),
            );
        message.channel.send({ embeds: [scEmbed], components: [scRow] });
    }
    if (message.content.toLowerCase().startsWith("??ts") && modders.includes(message.author.id)) {
        try {
            let param = message.content.replace('??ts ', '')
            param = param.split(' ')
            if (param.length < 1) {
                throw new Error('Invalid number of arguments.');
            }
            let timeleft = param[0]
            timeleft = timeleft * 60
            let timestamp = Math.floor(Date.now() / 1000);
            timestamp = timestamp + timeleft
            timestamp = `<t:${timestamp}:R>`
            message.channel.send(timestamp);
        } catch (error) {
            console.error('Error executing ??ts command:', error);
            message.channel.send('An error occurred while executing the ??ts command.');
        }
    }
    if (message.content.toLowerCase().startsWith("??startcayo") && modders.includes(message.author.id)) {
        joiners = []
        let param = message.content.replace('??startcayo ', '')
        param = param.split(' ')
        // let hno = param[0]
        let timeleft = param[0]
        timeleft = timeleft * 60
        let timestamp = Math.floor(Date.now() / 1000);
        timestamp = timestamp + timeleft
        timestamp = `<t:${timestamp}:R>`
        host = message.author.id
        let hostsc = await getsc(message.author.id)
        if (hostsc === null) {
            return message.channel.send('No Social Club username found for the host.');
        }

        message.delete();



        const cayoEmbed = new EmbedBuilder()
            .setTitle("Cayo Perico Heist")
            // .setURL("")
            .setDescription(`Cayo Perico Heist : ${timestamp}\nHost - SC: ${hostsc}\nCayo Perico Modded : 2.5m each \n \u200b`)
            .addFields(
                {
                    name: "***Steps to join heist***",
                    value: `1. Click set sc button to set your social club in our database.\n2. Click join heist button to join the heist.\n3. Patiently wait for your turn. [FCFS] \n \u200b`,
                },
                {
                    name: "***Rules***",
                    value: `1. Turn off your menus, if in use.\n2. Please refrain from DM-ing\n3. For any queries : <#1130802655799808052> \n \u200b`,
                },
            )
            // .setImage("https://cubedhuang.com/images/alex-knight-unsplash.webp")
            .setThumbnail(message.author.displayAvatarURL())
            .setColor("#00b0f4")
            .setFooter({
                text: "FFTC Mods",
                // iconURL: message.guild.icon_url,
            })
            .setTimestamp();

        // const cayoRow = new ActionRowBuilder()
        //     .addComponents(
        //         new ButtonBuilder()
        //             .setCustomId('join')
        //             .setEmoji('◀️')
        //             .setLabel('Join Heist')
        //             .setStyle(ButtonStyle.Secondary),
        //         new ButtonBuilder()
        //             .setCustomId('setsc')
        //             .setEmoji('🔆')
        //             .setLabel('Set Social Club')
        //             .setStyle(ButtonStyle.Secondary),
        //         new ButtonBuilder()
        //             .setCustomId('endheist')
        //             .setEmoji('🚫')
        //             .setLabel('End Heist')
        //             .setStyle(ButtonStyle.Secondary),
        //     );
        joiners = []
        const sentMessage = await message.channel.send({
            content: `Hello <@&1130802480456933436>, <@${host}> will be hosting this heist`,
            embeds: [cayoEmbed],
            // components: [cayoRow]
        });
        const heistThreadPromise = sentMessage.startThread({
            name: `Heist joiners list`,
            autoArchiveDuration: 60,
        });

        // const heistThread = await heistThreadPromise;
        // await heistThread.setLocked(true);
        heistThreadPromise.then(thread => {
            thread.setLocked(true);
            heistThreadId = thread.id;
            // console.log(`Thread created with ID: ${heistThreadId}`);
            const cayoRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`join ${heistThreadId}`)
                        .setEmoji('◀️')
                        .setLabel('Join Heist')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('setsc')
                        .setEmoji('🔆')
                        .setLabel('Set Social Club')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`endheist ${host} ${heistThreadId}`)
                        .setEmoji('🚫')
                        .setLabel('End Heist')
                        .setStyle(ButtonStyle.Secondary),
                );
            sentMessage.edit({
                components: [cayoRow]
            }).catch(error => {
                console.error('Error editing message with buttons:', error);
            });
        }).catch(error => {
            console.error('Error starting heist thread:', error);
        });
        const webhooks = await message.channel.fetchWebhooks();
        const found = webhooks.find(element => element.name.toLowerCase() === 'fftc');
        if (found) {
            heistWebHook = found;
        } else {
            message.channel.createWebhook({
                name: 'FFTC',
                avatar: 'https://media.istockphoto.com/id/1127235507/video/circular-interface-hud-design-infographic-elements-like-music-equalizer-audio-waves-or-sound.jpg?s=640x640&k=20&c=Fz18UW2MpatgZlYbUDy6OX9fEZjuuwfedKCfcjWrbEQ='
            })
                .then(webhook => {
                    // console.log(`Created webhook ${webhook}`);
                    heistWebHook = webhook;
                })
                .catch(console.error);
        }

    }
    if (message.content.toLowerCase() === '??help') {
        const embed = new EmbedBuilder()
            // .setAuthor({
            //     name: "Info",
            //     url: "https://example.com",
            // })
            .setTitle("Available Commands")
            .setDescription("Here are the available commands:")
            .addFields(
                {
                    name: "/ping",
                    value: `Check the bot\\'s latency \n \u200b`,
                },
                {
                    name: "??getsc [Discord ID or mention someone]",
                    value: `Get the Social Club username for a user  \n \u200b`,
                },
                {
                    name: "??sc",
                    value: `(modders' only command)\nCreate embed for other users to fill in their social club  \n \u200b`,
                },
                {
                    name: "??getmodders",
                    value: `Shows the list of all modders  \n \u200b`,
                },
                {
                    name: "??addmodder [Discord ID or mention someone]",
                    value: `Adds a modder through their discord ID in our database\nCan only be used by <@330632487812202498> for now \n \u200b`,
                },
                {
                    name: "??removemodder [Discord ID or mention someone]",
                    value: `Removes a modder through their discord ID in our database\nCan only be used by <@330632487812202498> for now \n \u200b`,
                },
                {
                    name: "??startcayo [Time left (in minutes)]",
                    value: `(modders' only command)\nGenerates embed for Cayo Perico Heist with ping.\nAdds 3 buttons: Join Heist, Set SC, End Heist.\nEnd Heist can only done by host who started this heist \n \u200b`,
                },
                {
                    name: "??ts [Time left (in minutes)]",
                    value: `(modders' only command)\nCheck timestamp working or not for Cayo Perico heist \n \u200b`,
                },
            )
            // .setImage("https://cubedhuang.com/images/alex-knight-unsplash.webp")
            // .setThumbnail("https://dan.onl/images/emptysong.jpg")
            .setColor("#00b0f4")
            .setFooter({
                text: "FFTC",
                // iconURL: "https://slate.dan.onl/slate.png",
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }


});
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isModalSubmit() && interaction.customId === 'scModal') {
        const discordId = interaction.user.id;
        const scUsername = interaction.fields.getTextInputValue('scInput');

        try {
            await scSchema.findOneAndUpdate(
                { discordId },
                { scUsername },
                { upsert: true }
            );
            await interaction.reply({
                content: "Social Club username saved successfully!",
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error saving to MongoDB:', error);
            await interaction.reply({
                content: "Failed to save Social Club username.",
                ephemeral: true,
            });
        }
    }
});
client.on('interactionCreate', async (interaction) => {

    // if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        interaction.reply(`🏓Latency is ${Date.now() - interaction.createdTimestamp}ms. 
        API Latency is ${Math.round(client.ws.ping)}ms`);
    }

    if (interaction.isButton() && interaction.customId === 'setsc') {
        const modal = new ModalBuilder()
            .setCustomId('scModal')
            .setTitle('Social Club');
        const scInput = new TextInputBuilder()
            .setCustomId('scInput')
            .setLabel("What's your username on Social Club?")
            .setStyle(TextInputStyle.Short);
        const firstActionRow = new ActionRowBuilder().addComponents(scInput);
        modal.addComponents(firstActionRow);
        await interaction.showModal(modal);
    }
    if (interaction.isButton() && interaction.customId.startsWith('endheist')) {
        let param = interaction.customId.replace('endheist ', '')
        param = param.split(' ')
        host = param[0]
        heistThreadId = param[1]
        // console.log(heistThreadId)
        // host="380395559921385473"
        if (interaction.user.id !== host) {
            await interaction.reply({
                content: 'Only the host can end this Heist!',
                ephemeral: true
            });
        } else {
            // const components = interaction.message.components;
            // const actionRow = components[0]; 
            // actionRow.components.forEach(component => {
            //     if (component.type === 'BUTTON') {
            //       component.setDisabled(true); // Disable the button
            //     }
            // });
            const user = await interaction.client.users.fetch(interaction.user.id);
            const userImageUrl = user.displayAvatarURL({ format: 'png', dynamic: true });

            const cayoRowDisabled = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('join')
                        .setEmoji('◀️')
                        .setLabel('Join Heist')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('setsc')
                        .setEmoji('🔆')
                        .setLabel('Set Social Club')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('endheist')
                        .setEmoji('🚫')
                        .setLabel('End Heist')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                );
            const cayoEmbedEnded = interaction.message.embeds[0]

            timestampEnded = Math.floor(Date.now() / 1000);
            timestampEnded = `<t:${timestampEnded}:R>`
            const cayoEmbedEndedheist = new EmbedBuilder()
                .setTitle("Cayo Perico Heist")
                // .setURL("")
                .setDescription(cayoEmbedEnded.description)
                .addFields(
                    {
                        name: "***Steps to join heist***",
                        value: `1. Click set sc button to set your social club in our database.\n2. Click join heist button to join the heist.\n3. Patiently wait for your turn. [FCFS] \n \u200b`,
                    },
                    {
                        name: "***Rules***",
                        value: `1. Turn off your menus, if in use.\n2. Please refrain from DM-ing\n3. For any queries : <#1130802655799808052> \n \u200b`,
                    },
                    {
                        name: "***Heist Ended***",
                        value: `Heist ended : ${timestampEnded} \nNumber of heist joiners in this session : ${joiners.length} \nThanks for joining in \n \u200b`,

                    },
                )
                // .setImage("https://cubedhuang.com/images/alex-knight-unsplash.webp")
                .setThumbnail(userImageUrl)
                .setColor("#00b0f4")
                .setFooter({
                    text: "FFTC Mods",
                    // iconURL: message.guild.icon_url,
                })
                .setTimestamp();

            await interaction.update({
                // content: 'Thanks for joining the Heist!',
                embeds: [cayoEmbedEndedheist],
                components: [cayoRowDisabled]
            });
            const thanksEmbed = new EmbedBuilder()
                .setAuthor({
                    name: "FFTC Mods",
                    iconURL: "https://media.discordapp.net/attachments/1099602135752130560/1099603282206392384/FFTC_logo.png",
                })
                .setTitle("Thanks for joining!")
                .setDescription("The current hoster has finished for the session. He will complete remaining heists until everyone reacted has been finished. No other reacts will be counted to be done. Positive things from all of you everday motivates us to do this everyday! The next Host will be in a couple hours stay tuned! If you want more then the one, <#1130802641971191818> are always available.\n\nThank you from FFTC Modder Team")
                .setColor("#b30000")
                .setFooter({
                    text: "Brought to you by FFTC Mods",
                    iconURL: "https://media.discordapp.net/attachments/1099602135752130560/1099603282206392384/FFTC_logo.png",
                });

            await interaction.channel.send({ embeds: [thanksEmbed] });

            const webhooks = await interaction.channel.fetchWebhooks();
            const found = webhooks.find(element => element.name.toLowerCase() === 'fftc');
            if (found) {
                heistWebHook = found;
            } else {
                interaction.channel.createWebhook({
                    name: 'FFTC',
                    avatar: 'https://media.istockphoto.com/id/1127235507/video/circular-interface-hud-design-infographic-elements-like-music-equalizer-audio-waves-or-sound.jpg?s=640x640&k=20&c=Fz18UW2MpatgZlYbUDy6OX9fEZjuuwfedKCfcjWrbEQ='
                })
                    .then(webhook => {
                        // console.log(`Created webhook ${webhook}`);
                        heistWebHook = webhook;
                    })
                    .catch(console.error);
            }

            await heistWebHook.send({
                content: `Number of heist joiners in this session : ${joiners.length} \nThanks for joining in.`,
                threadId: heistThreadId,
            });
            // Retrieve the thread channel
            let threadChannel = await interaction.guild.channels.fetch(heistThreadId);
            await threadChannel.setArchived(true);

            // Close and lock the thread
            // await threadChannel.setLocked(true);
        }
    }

    if (interaction.isButton() && interaction.customId === 'nxt') {
        // dont know
    }

    if (interaction.isButton() && interaction.customId.startsWith('join')) {
        let param = interaction.customId.replace('join ', '')
        param = param.split(' ')
        heistThreadId = param[0]
        // console.log(heistThreadId)
        const webhooks = await interaction.channel.fetchWebhooks();
        const found = webhooks.find(element => element.name.toLowerCase() === 'fftc');
        if (found) {

            heistWebHook = found;
        } else {
            await interaction.channel.createWebhook({
                name: 'FFTC',
                avatar: 'https://media.istockphoto.com/id/1127235507/video/circular-interface-hud-design-infographic-elements-like-music-equalizer-audio-waves-or-sound.jpg?s=640x640&k=20&c=Fz18UW2MpatgZlYbUDy6OX9fEZjuuwfedKCfcjWrbEQ='
            })
                .then(webhook => {
                    // console.log(`Created webhook ${webhook}`);
                    heistWebHook = webhook;
                })
                .catch(console.error);
        }

        const user = interaction.user;
        const discordId = user.id;

        if (joiners.includes(discordId)) {
            // console.log(joiners)
            await interaction.reply({
                content: 'You have already joined the heist!',
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: 'Joining the heist with your saved social club',
                ephemeral: true
            });
            try {
                const doc = await scSchema.findOne({ discordId });
                if (doc) {

                    const scUsername = doc.scUsername;
                    if (!scUsername) {
                        scUsername = `<@${discordId}`
                    }
                    joiners.push(discordId);
                    await heistWebHook.send({
                        content: `Discord Tag : <@${discordId}> \nDiscord id : ${discordId} \nSocial Club : ${scUsername} \n `,
                        threadId: heistThreadId,
                    });

                } else {
                    await heistWebHook.send({
                        content: `No Social Club username found for this Discord user : <@${discordId}> \n `,
                        threadId: heistThreadId,
                    });
                }
            } catch (error) {
                console.error('Error retrieving data from MongoDB:', error);
                await interaction.reply({
                    content: 'Failed to retrieve Social Club username.',
                    ephemeral: true
                });
            }
        }
    }
})

// keepAlive()
// const mySecret = process.env['TOKEN']
// client.login(mySecret)