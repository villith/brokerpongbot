import { Action, IMessageEvent } from "../types";
import { ChatPostMessageArguments, MessageAttachment, WebClient } from "@slack/web-api";

import COMMANDS from "./cmds";

const addPlayer: Action = (
  client: WebClient,
  msg: IMessageEvent,
  args: any
) => {
  console.log(msg);
  console.log(args);
};

const commands: Action = (
  client: WebClient,
  msg: IMessageEvent,
  args: any
) => {
  const message: ChatPostMessageArguments = {
    text: 'BrokerPongBot Commands',
    mrkdwn: true,
    channel: msg.channel,
  };

  const attachments: MessageAttachment[] = Object.entries(COMMANDS).map(([key, command]) => {
    const attachment: MessageAttachment = {};
    attachment.title = command.name;
    attachment.text = command.description;
    attachment.fields = [{
      title: 'Aliases',
      value: command.aliases.join(', '),
    }];
    return attachment;
  });
  
  message.attachments = attachments;

  console.log('posting message');
  client.chat.postMessage(message);
};

export { addPlayer, commands };
