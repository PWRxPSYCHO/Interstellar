import Axios from 'axios';
import { ChannelManager, MessageEmbed, TextChannel } from 'discord.js';
import moment from 'moment';
import { chID } from './models/config';
import { RocketRespV4 } from './models/SpaceX/Rocket-Response-V4';
import { Util } from './util';
import { ULResponseV4 } from './models/SpaceX/UL-Response-V4';

export class SpaceX {

    private _currentULrespV4: ULResponseV4;

    private _rocketResponse: RocketRespV4;


    public get currentULRespV4(): ULResponseV4 {
        return this._currentULrespV4;
    }

    public get rocketResponse(): RocketRespV4 {
        return this._rocketResponse;
    }

    public set rocketResponse(rocketResponse: RocketRespV4) {
        this._rocketResponse = rocketResponse;
    }


    public set currentULRespV4(currentULRespV4: ULResponseV4) {
        this._currentULrespV4 = currentULRespV4;
    }

    readonly util = new Util();


    async getULRequest(channels: ChannelManager) {
        const channel = await channels.fetch(chID) as TextChannel;
        const reqURL = 'https://api.spacexdata.com/v4/launches/upcoming';
        const resp = await Axios.get(reqURL);
        if (resp.status === 200) {
            const today = new Date();
            const momentDate = moment(today).unix();
            const ulResp = resp.data as ULResponseV4[];
            const filteredResp = ulResp.filter(upcoming => upcoming.date_unix >= momentDate);
            return filteredResp[0];
        } else {
            this.util.apiError(resp, channel);
        }
    }

    async getRocket(resp: ULResponseV4, channels: ChannelManager) {
        const channel = await channels.fetch(chID) as TextChannel;
        const reqURL = 'https://api.spacexdata.com/v4/rockets/' + resp.rocket;

        const rocketRep = await Axios.get(reqURL);
        if (rocketRep.status === 200) {
            return rocketRep.data as RocketRespV4;
        } else {
            this.util.apiError(rocketRep, channel);
        }
    }
    async processULResponse(resp: ULResponseV4, rocketResp: RocketRespV4, channels: ChannelManager) {
        const channel = await channels.fetch(chID) as TextChannel;
        const embed = new MessageEmbed();
        embed.setTitle(resp.name);
        embed.setColor(0x4286f4);
        embed.setAuthor("SpaceX", "https://media-exp1.licdn.com/dms/image/C560BAQEbqLQ-JE0vdQ/company-logo_200_200/0?e=2159024400&v=beta&t=KmtDUngLjKVIqjsjZ9c3IENwunQAGkau3_AZh9rSeOg", "https://docs.spacexdata.com/");
        if (resp.details) {
            embed.setDescription(resp.details);
        }
        if (resp.links.reddit) {
            embed.setURL(resp.links.reddit.campaign);
        }
        if (resp.links.webcast) {
            embed.addField('YouTube: ', resp.links.webcast);
        }
        if (resp.links.patch) {
            embed.setThumbnail(resp.links.patch.large);
        }
        embed.addField('Rocket: ', rocketResp.name);
        const date = moment(resp.date_local).format('LLLL');
        embed.setFooter('*Launch Date: *' + date);
        channel.send(embed);
    }
}