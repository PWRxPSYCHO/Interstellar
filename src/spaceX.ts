import Axios from 'axios';
import { ChannelManager, MessageEmbed, TextChannel } from 'discord.js';
import moment from 'moment';
import { chID } from './models/config';
import { ULResponse } from './models/SpaceX/UL-Response';
import { Util } from './util';

export class SpaceX {
    private _prevULResp: ULResponse;
    private _currentULResp: ULResponse;


    public get prevULResponse(): ULResponse {
        return this._prevULResp;
    }

    public get currentULResp(): ULResponse {
        return this._currentULResp;
    }

    public set prevULResponse(ulResp: ULResponse) {
        this._prevULResp = ulResp;
    }

    public set currentULResp(ulResp: ULResponse) {
        this._currentULResp = ulResp;
    }


    readonly util = new Util();


    launchDay(today: Date, ulLaunchDate: Date): boolean {
        if (today.getFullYear() === ulLaunchDate.getFullYear()) {
            if (today.getMonth() === ulLaunchDate.getMonth()) {
                if (today.getDate() === ulLaunchDate.getFullYear()) {
                    if (ulLaunchDate.getHours() - today.getHours() === 1) {
                        return true;
                    }
                }
            }
        } else {
            return false;
        }

    }

    async getULRequest(channels: ChannelManager) {
        const channel = await channels.fetch(chID) as TextChannel;
        const reqURL = 'https://api.spacexdata.com/v3/launches/next';
        const resp = await Axios.get(reqURL);
        if (resp.status === 200) {
            const ulResp = resp.data as ULResponse;
            return ulResp;
        } else {
            this.util.apiError(resp, channel);
        }
    }
    async processULResponse(resp: ULResponse, channels: ChannelManager) {
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
}