import { env } from 'process';
import { channelID } from '../config.json';

export const token: string = env.DISCORD_TOKEN;
export const nasaToken: string = env.API_KEY;
export const chID: string = channelID;