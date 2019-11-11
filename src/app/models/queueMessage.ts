import { Player } from "./player";
import { ActionEnum } from './actionEnum';

export class QueueMessage {
    MessageType: ActionEnum;
    Target: Player;
    RawData: any;

    constructor(messageType: ActionEnum, rawData: any, target: Player) {
        this.MessageType = messageType;
        this.RawData = rawData;
        this.Target = target;
    }
}