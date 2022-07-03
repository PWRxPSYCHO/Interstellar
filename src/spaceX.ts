import Axios from 'axios';
import { ChannelManager, EmbedAuthorData, EmbedField, EmbedFooterData, TextChannel } from 'discord.js';
import moment from 'moment';
import { chID } from './models/config';
import { RocketRespV4 } from './models/SpaceX/Rocket-Response-V4';
import { Util } from './util';
import { ULResponseV4 } from './models/SpaceX/UL-Response-V4';
import { LaunchpadResponseV4 } from './models/SpaceX/Launchpad-Response-V4';
import { EmbedBuilder } from '@discordjs/builders';

export class SpaceX {

    private _currentULrespV4!: ULResponseV4;

    private _rocketResponse!: RocketRespV4;

    private _launchpadResponse!: LaunchpadResponseV4;


    public get launchpadResponse(): LaunchpadResponseV4 {
        return this._launchpadResponse;
    }
    public set launchpadResponse(value: LaunchpadResponseV4) {
        this._launchpadResponse = value;
    }


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


    async getULRequest(channels: ChannelManager): Promise<ULResponseV4 | null> {
        const channel = await channels.fetch(chID) as TextChannel;
        const reqURL = 'https://api.spacexdata.com/v4/launches/upcoming';
        const resp = await Axios.get(reqURL);
        if (resp.status === 200) {
            const today = new Date();
            const momentDate = moment(today).unix();
            const ulResp = resp.data as ULResponseV4[];
            const filteredResp = ulResp.filter(upcoming => upcoming.date_unix >= momentDate);
            this.launchpadResponse = await this.getLaunchPad(filteredResp[0].launchpad, channels);
            return filteredResp[0];
        } else {
            this.util.apiError(resp, channel);
            return null;
        }
    }

    async getLaunchPad(launchpadId: string, channels: ChannelManager): Promise<LaunchpadResponseV4> {
        const channel = await channels.fetch(chID) as TextChannel;
        const reqURL = `https://api.spacexdata.com/v4/launchpads/${launchpadId}`;
        const resp = await Axios.get(reqURL);
        if (resp.status === 200) {
            return resp.data as LaunchpadResponseV4;
        } else {
            this.util.apiError(resp, channel);
            return resp.data as LaunchpadResponseV4;
        }
    } 

    async getRocket(resp: ULResponseV4, channels: ChannelManager): Promise<RocketRespV4 | null> {
        const channel = await channels.fetch(chID) as TextChannel;
        const reqURL = 'https://api.spacexdata.com/v4/rockets/' + resp.rocket;

        const rocketRep = await Axios.get(reqURL);
        if (rocketRep.status === 200) {
            return rocketRep.data as RocketRespV4;
        } else {
            this.util.apiError(rocketRep, channel);
            return null;
        }
    }
    async processULResponse(resp: ULResponseV4, rocketResp: RocketRespV4, channels: ChannelManager) {
        const channel = await channels.fetch(chID) as TextChannel;
        const embed = new EmbedBuilder();
        embed.setTitle(resp.name);
        embed.setColor(0x4286f4);
        embed.setAuthor({
            name: `SpaceX`,
            iconURL: 'https://media-exp1.licdn.com/dms/image/C560BAQEbqLQ-JE0vdQ/company-logo_200_200/0?e=2159024400&v=beta&t=KmtDUngLjKVIqjsjZ9c3IENwunQAGkau3_AZh9rSeOg',
            url: 'https://docs.spacexdata.com/'
        } as EmbedAuthorData);
        if (resp.details) {
            embed.setDescription(resp.details);
        }
        if (resp.links.webcast) {
            embed.addFields({ name: 'YouTube: ', value: resp.links.webcast } as EmbedField);
        }
        if (resp.links.patch) {
            embed.setThumbnail(resp.links.patch.large);
        }
        const launchpadName = { name: 'Launchpad', value: this.launchpadResponse.name, inline: true } as EmbedField;
        const rocketField = {
            name: 'Rocket:', value: rocketResp.name, inline: true
        } as EmbedField
        // const coordinates = { name: 'Lat/Long', value: `${this.launchpadResponse.latitude}/${this.launchpadResponse.longitude}`, inline: false } as EmbedField;
        // const payload = { name: 'Payload', value: this._currentULrespV4.payloads, inline: true };
        // const payloadMass = {name: 'Payload Mass', value: '', inline:true};
        // const coreFlights = { name: 'Flight # on core', value: this._currentULrespV4.cores[0].flight.toString(), inline: true } as EmbedField;

        embed.addFields([launchpadName, rocketField]);

       // const landingZone = {name:'Landing Pad: ', value: rocketResp.} as EmbedField;
        //embed.addField('Rocket: ', rocketResp.name);
        const date = moment(resp.date_local).format('LLLL'); 
        embed.setFooter({ text: `Launch Date: ${date}` } as EmbedFooterData);
        channel.send({ content: '', embeds: [embed], });
    }
}