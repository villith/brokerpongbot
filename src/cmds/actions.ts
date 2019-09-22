import { ChatPostMessageArguments, MessageAttachment } from "@slack/web-api";

import { Action } from "../types";
import COMMANDS from "./cmds";
import axios from 'axios';

const addPlayer: Action = async (
  client,
  msg,
  args,
) => {
  const message: ChatPostMessageArguments = {
    text: '',
    channel: msg.channel,
  };

  const invalidNameText = 'User was not created. You must provide a name for the user. `!addPlayer <name>`';
  if (!args) {
    message.text = invalidNameText;
    client.chat.postMessage(message);
    return;
  }
  
  const [name] = args;
  if (!name) {
    message.text = invalidNameText;
    client.chat.postMessage(message);
    return;
  }

  const { data } = await axios.post('add-player', { name });

  message.text = data;

  client.chat.postMessage(message);
};

const getStandings: Action = (
  client,
  msg,
  args,
) => {

};

const commands: Action = (
  client,
  msg,
  args,
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
