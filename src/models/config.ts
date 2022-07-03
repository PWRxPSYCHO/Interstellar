import { env } from 'process';
import { channelID } from '../config.json';

export const token: string = env.DISCORD_TOKEN as string;
export const chID: string = channelID;