import { Client, MessageEmbed, Message, ChannelManager, TextChannel } from 'discord.js';
import { token, nasaToken, chID } from './models/config';
import { APODResponse } from './models/APOD/apod-response';
import Axios from 'axios';
import { ApodRequest } from './models/APOD/apod-request';
import moment from 'moment';
import cron from 'node-cron';

const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

cron.schedule('0 12 * * 0-6', async () => { // At 12:00 on every day-of-week from Sunday through Saturday.
    console.log('Running At 12:00 on every day-of-week from Sunday through Saturday.');
    const today = new Date();
    const todaysDate = moment(today).format('yyyy-MM-DD').toString();
    const req: ApodRequest = {
        api_key: nasaToken,
        date: todaysDate,
        hd: true
    }
    await getAPODReq(req, client.channels);
});

async function getAPODReq(req: ApodRequest, channels: ChannelManager) {
    const channel = await channels.fetch(chID) as TextChannel;
    let apodResponse: APODResponse;
    const url = 'https://api.nasa.gov/planetary/apod?' + 'api_key=' + req.api_key + '&' + 'date=' + req.date + '&' + 'hd=' + req.hd;
    Axios.get(url).then(resp => {
        if (resp.status === 200) {
            console.log('Succesful. Processing now...');
            apodResponse = {
                date: resp.data.date,
                explanation: resp.data.explanation,
                hdurl: resp.data.hdurl,
                title: resp.data.title,
                url: resp.data.url
            };
            processResponse(apodResponse, channel);
        } else {
            console.log('Status Code: ' + resp.status);
            const embedMessage = new MessageEmbed();
            embedMessage.setTitle('Failed to fetch APOD!');
            embedMessage.setColor(0xFF0000);
            embedMessage.setThumbnail('https://s3.amazonaws.com/digitaltrends-uploads-prod/2015/08/black-hole.jpg');
            embedMessage.setDescription('Code: ' + (resp && resp.status));
            channel.send(embedMessage);
        }
    });
}
async function processResponse(resp: APODResponse, channel: TextChannel) {
    const embed = new MessageEmbed();
    embed.setTitle(resp.title);
    embed.setColor(0x4286f4);
    embed.setThumbnail(resp.hdurl);
    embed.setDescription(resp.explanation);
    channel.send(embed);

}
client.login(token);