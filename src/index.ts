import { Client } from 'discord.js';
import { config } from 'dotenv';
import moment from 'moment';
import cron from 'node-cron';
import { ApodRequest } from './models/APOD/apod-request';
import { nasaToken, token } from './models/config';
import { RocketRespV4 } from './models/SpaceX/Rocket-Response-V4';
import { ULResponseV4 } from './models/SpaceX/UL-Response-V4';
import { NASA } from './nasa';
import { SpaceX } from './spaceX';

config();
const client = new Client();

const spaceX = new SpaceX();
const nasa = new NASA();


client.once('ready', () => {
    console.log('Online');
});

client.once("shardReconnecting", id => {
    console.log(`Shard with ID ${id} reconnected`);
});

client.once("shardDisconnect", (event, shardID) => {
    console.log(`Disconnected from event ${event} with ID ${shardID}`);
});

cron.schedule('0 12 * * 0-6', async () => {
    console.log('Running At 12:00 on every day-of-week from Sunday through Saturday.');
    const today = new Date();
    const todaysDate = moment(today).format('yyyy-MM-DD').toString();
    const req: ApodRequest = {
        api_key: nasaToken,
        date: todaysDate,
        hd: true
    }
    await nasa.getAPODReq(req, client.channels);
});

cron.schedule('0 10 * * 0-6', async () => {
    spaceX.currentULRespV4 = await spaceX.getULRequest(client.channels) as ULResponseV4;
    spaceX.rocketResponse = await spaceX.getRocket(spaceX.currentULRespV4, client.channels) as RocketRespV4;

    spaceX.processULResponse(spaceX.currentULRespV4, spaceX.rocketResponse, client.channels);
});


client.login(token);