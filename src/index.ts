import { Client, MessageEmbed, Message } from 'discord.js';
import { token, nasaToken } from './models/config';
import { APODResponse } from './models/apod-response';
import Axios from 'axios';
import { ApodRequest } from './models/apod-request';
import moment from 'moment';


const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.startsWith('!')) {
        const req = setAPODReq();
        getAPODReq(req, msg);
        msg.channel.send('Pong!');
    }
});

function setAPODReq(): ApodRequest {
    const today = new Date();
    const todaysDate = moment(today).format('yyyy-MM-DD').toString();
    const req: ApodRequest = {
        api_key: nasaToken,
        date: todaysDate,
        hd: 'True'
    }
    return req;
}

function getAPODReq(req: ApodRequest, msg: Message) {
    let apodResponse: APODResponse;
    const url = 'https://api.nasa.gov/planetary/apod?' + 'api_key=' + req.api_key + '&' + 'date=' + req.date + '&' + 'hd=' + req.hd;
    console.log(url);
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
            processResponse(apodResponse, msg);
        } else {
            console.log('Status Code: ' + resp.status);
            const embedMessage = new MessageEmbed();
            embedMessage.setTitle('Failed to fetch APOD!');
            embedMessage.setColor(0xFF0000);
            embedMessage.setThumbnail('https://s3.amazonaws.com/digitaltrends-uploads-prod/2015/08/black-hole.jpg');
            embedMessage.setDescription('Code: ' + (resp && resp.status));
            msg.channel.send(embedMessage);
        }
    });
}
function processResponse(resp: APODResponse, msg: Message) {
    const embed = new MessageEmbed();
    embed.setTitle(resp.title);
    embed.setColor(0x4286f4);
    embed.setThumbnail(resp.hdurl);
    embed.setDescription(resp.explanation);
    msg.channel.send(embed);

}
client.login(token);