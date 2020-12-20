import Axios from 'axios';
import { ChannelManager, MessageEmbed, TextChannel } from 'discord.js';
import { ApodRequest } from './models/APOD/apod-request';
import { APODResponse } from './models/APOD/apod-response';
import { chID } from './models/config';
import { Util } from './util';

export class NASA {
    readonly util = new Util();

    async getAPODReq(req: ApodRequest, channels: ChannelManager) {
        const channel = await channels.fetch(chID) as TextChannel;
        const url = 'https://api.nasa.gov/planetary/apod?' + 'api_key=' + req.api_key + '&' + 'date=' + req.date + '&' + 'hd=' + req.hd;
        const resp = await Axios.get(url);
        if (resp.status === 200) {
            const apodResponse = resp.data as APODResponse;
            this.processAPODResponse(apodResponse, channel);
        } else {
            this.util.apiError(resp, channel);
        }
    }
    async processAPODResponse(resp: APODResponse, channel: TextChannel) {
        const embed = new MessageEmbed();
        embed.setTitle(resp.title);
        embed.setAuthor("NASA", "https://cdn.iconscout.com/icon/free/png-256/nasa-282190.png", "https://www.nasa.gov/");
        embed.setColor(0x4286f4);
        if (resp.media_type == "video") {
            embed.setURL(resp.url);
        }
        if (resp.media_type == "image") {
            embed.setThumbnail(resp.hdurl);
        }
        embed.setDescription(resp.explanation);
        embed.setFooter("NASA APOD API");
        channel.send(embed);
    }
}