import { AxiosResponse } from 'axios';
import { MessageEmbed, TextChannel } from 'discord.js';

export class Util {

    apiError(resp: AxiosResponse<any, any>, channel: TextChannel) {
        console.log('Status Code: ' + resp.status);
        const embedMessage = new MessageEmbed();
        embedMessage.setTitle('Failed to fetch APOD!');
        embedMessage.setColor(0xFF0000);
        embedMessage.setThumbnail('https://s3.amazonaws.com/digitaltrends-uploads-prod/2015/08/black-hole.jpg');
        embedMessage.setDescription('Code: ' + (resp.status));
        channel.send({ embeds: [embedMessage] });
    }
}