require('dotenv').config();
const mongo = require('./mongo');
const scSchema = require('../schemas/sc');
const modSchema = require('../schemas/mod');
const { Client, GatewayIntentBits, EmbedBuilder, PermissionBitField, Permissions } = require('discord.js');
const { MessageActionRow, MessageButton, ActionRowBuilder } = require('discord.js');
const { ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

let modders = []
let joiners = []
let host
let heistThreadId;
let heistWebHook;

async function start() {
    try {
        const mongoose = await mongo();
        console.log('Connected to MongoDB');
        client.login(process.env.TOKEN);
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
    client.user.setActivity(`hi`);

    const ping = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('This is a ping command');

    client.application.commands.create(ping);
});

client.on("messageCreate", async (message) => {
    if (message.content.startsWith("--cloneherefrom") && (message.author.id === `428902961847205899`)) {
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
    if (message.content.startsWith('??addmodder') && modders.includes(message.author.id)) {
        const args = message.content.split(' ');
        if (args.length !== 2) {
            return message.reply('Invalid command format. Please provide a valid Discord ID.');
        }

        const discordId = args[1];

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
        } catch (error) {
            console.error('Error adding modder:', error);
            message.reply('An error occurred while adding the modder.');
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
            } else {
                message.channel.send('No modders found in the database.');
            }
        } catch (error) {
            console.error('Error retrieving modders:', error);
            message.channel.send('An error occurred while retrieving modders.');
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
            .setURL("https://discord.com/channels/904713062060265533/904713811318153287")
            .setDescription(`Cayo Perico Heist : ${timestamp}\nHost - SC: ${hostsc}\nCayo Perico Modded : 2.5m each`)
            .addFields(
                {
                    name: "***Steps to join heist***",
                    value: "1. Click set sc button to set your social club in our database.\n2. Click join heist button to join the heist.\n3. Patiently wait for your turn. [FCFS]",
                },
                {
                    name: "***Rules***",
                    value: "1. Turn off your menus, if in use.\n2. Please refrain from DM-ing\n3. For any queries : <#channelid >",
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
            content: `Hello <@&1130126795837022302>, <@${host}> will be hosting this heist`,
            embeds: [cayoEmbed],
            components: [cayoRow]
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
                .setURL("https://discord.com/channels/904713062060265533/904713811318153287")
                .setDescription(cayoEmbedEnded.description)
                .addFields(
                    {
                        name: "***Steps to join heist***",
                        value: "1. Click set sc button to set your social club in our database.\n2. Click join heist button to join the heist.\n3. Patiently wait for your turn. [FCFS]",
                    },
                    {
                        name: "***Rules***",
                        value: "1. Turn off your menus, if in use.\n2. Please refrain from DM-ing\n3. For any queries : <#channelid >",
                    },
                    {
                        name: "***Heist Ended***",
                        value: `Heist ended : ${timestampEnded} \nNumber of heist joiners in this session : ${joiners.length} \nThanks for joining in`,

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
            const threadChannel = await interaction.guild.channels.fetch(heistThreadId);

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