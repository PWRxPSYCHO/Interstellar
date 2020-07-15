import { Client } from 'discord.js';
import { token, nasaToken } from './models/config';
import { APODResponse } from './models/apod-response';
import { request } from 'https';
import * as moment from 'moment';
import { ApodRequest } from './models/apod-request';
const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.startsWith('!')) {
        getAPODReq();
        msg.channel.send('Pong!');
    }
});

function setAPODReq(): ApodRequest {
    const req: ApodRequest = {
        apiKey: nasaToken,
        hd: true
    }
    return req;
}

function getAPODReq(): APODResponse {
    return null;

}
client.login(token);