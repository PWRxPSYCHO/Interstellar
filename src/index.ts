import { Client } from 'discord.js';
import * as env from 'dotenv';
import moment from 'moment';
import cron from 'node-cron';
import { ApodRequest } from './models/APOD/apod-request';
import { nasaToken, token } from './models/config';
import { NASA } from './nasa';
import { SpaceX } from './spaceX';

env.config();
const client = new Client();

const spaceX = new SpaceX();
const nasa = new NASA();

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
    spaceX.currentULRespV4 = await spaceX.getULRequest(client.channels);
    spaceX.rocketResponse = await spaceX.getRocket(spaceX.currentULRespV4, client.channels);

    spaceX.processULResponse(spaceX.currentULRespV4, spaceX.rocketResponse, client.channels);
});


client.login(token);