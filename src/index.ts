import { Client, MessageEmbed, Message, ChannelManager, TextChannel } from 'discord.js';
import { token, nasaToken, chID } from './models/config';
import { APODResponse } from './models/APOD/apod-response';
import Axios from 'axios';
import { ApodRequest } from './models/APOD/apod-request';
import moment from 'moment';
import cron from 'node-cron';
import { ULResponse } from './models/SpaceX/UL-Response';

const client = new Client();

let prevULResp: ULResponse;
let currentULResp: ULResponse;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
client.on('message', async (msg) => {
    if (msg.content.startsWith('!')) {
        // placeholder
    }
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

cron.schedule('* * * * *', async () => {
    if (!currentULResp) {
        currentULResp = await getULRequest(client.channels);
    }
    if (currentULResp !== prevULResp) {
        processULResponse(currentULResp, client.channels);
        prevULResp = currentULResp;
    }
});


async function getULRequest(channels: ChannelManager) {
    const channel = await channels.fetch(chID) as TextChannel;
    const reqURL = 'https://api.spacexdata.com/v3/launches/upcoming';
    const resp = await Axios.get(reqURL);
    if (resp.status === 200) {
        const ulResp = resp.data as ULResponse[];
        const today = new Date().toISOString();
        const filteredResp = ulResp.filter(upcoming => upcoming.launch_date_utc >= today);
        const nextMission = filteredResp[0];
        return nextMission;
    } else {
        apiError(resp, channel);
    }
}

async function getAPODReq(req: ApodRequest, channels: ChannelManager) {
    const channel = await channels.fetch(chID) as TextChannel;
    const url = 'https://api.nasa.gov/planetary/apod?' + 'api_key=' + req.api_key + '&' + 'date=' + req.date + '&' + 'hd=' + req.hd;
    Axios.get(url).then(resp => {
        if (resp.status === 200) {
            const apodResponse = resp.data as APODResponse;
            processAPODResponse(apodResponse, channel);
        } else {
            apiError(resp, channel);
        }
    });
}
function apiError(resp, channel: TextChannel) {
    console.log('Status Code: ' + resp.status);
    const embedMessage = new MessageEmbed();
    embedMessage.setTitle('Failed to fetch APOD!');
    embedMessage.setColor(0xFF0000);
    embedMessage.setThumbnail('https://s3.amazonaws.com/digitaltrends-uploads-prod/2015/08/black-hole.jpg');
    embedMessage.setDescription('Code: ' + (resp.status));
    channel.send(embedMessage);
}

async function processAPODResponse(resp: APODResponse, channel: TextChannel) {
    const embed = new MessageEmbed();
    embed.setTitle(resp.title);
    embed.setColor(0x4286f4);
    embed.setThumbnail(resp.hdurl);
    embed.setDescription(resp.explanation);
    channel.send(embed);
}

async function processULResponse(resp: ULResponse, channels: ChannelManager) {
    const channel = await channels.fetch(chID) as TextChannel;
    const embed = new MessageEmbed();
    embed.setTitle(resp.mission_name);
    embed.setColor(0x4286f4);
    if (resp.details) {
        embed.setDescription(resp.details);
    }
    if (resp.links.reddit_campaign) {
        embed.setURL(resp.links.reddit_campaign);
    }
    if (resp.links.video_link) {
        embed.addField('YouTube: ', resp.links.video_link);
    }
    embed.addField('Rocket: ', resp.rocket.rocket_name);
    const date = moment(resp.launch_date_local).format('MMMM Do YYYY, h:mm:ss a');
    embed.setFooter('Launch Date: ' + date);
    channel.send(embed);
}
client.login(token);