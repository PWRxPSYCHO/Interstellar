import { Client, } from 'discord.js';
import * as env from 'dotenv';
import moment from 'moment';
import cron from 'node-cron';
import { ApodRequest } from './models/APOD/apod-request';
import { token } from './models/config';
import { RocketRespV4 } from './models/SpaceX/Rocket-Response-V4';
import { ULResponseV4 } from './models/SpaceX/UL-Response-V4';
import { NASA } from './nasa';
import { SpaceX } from './spaceX';

env.config();
const client = new Client({ intents: [] });

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
        api_key: process.env.API_KEY as string,
        date: todaysDate,
        hd: true
    }
    await nasa.getAPODReq(req, client.channels);
});

//
cron.schedule('0 10 * * 0-6', async () => {
    spaceX.currentULRespV4 = await spaceX.getULRequest(client.channels) as ULResponseV4;
    spaceX.rocketResponse = await spaceX.getRocket(spaceX.currentULRespV4, client.channels) as RocketRespV4;

    spaceX.processULResponse(spaceX.currentULRespV4, spaceX.rocketResponse, client.channels);
});

// cron.schedule('* * * * *', async () => {
//     if (spaceX.currentULRespV4 !== null) {
//         if (spaceX.currentULRespV4.date_unix === Math.floor((Date.now() / 1000))) {
//             // process flight response

//         }
//     }

// })


client.login(token);