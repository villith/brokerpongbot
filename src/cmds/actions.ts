import { ChatPostMessageArguments, MessageAttachment } from "@slack/web-api";

import { Action } from "../types";
import COMMANDS from "./cmds";
import axios from 'axios';

const addPlayer: Action = async (
  client,
  msg,
  name,
) => {
  console.log('[addPlayer]');
  const message: ChatPostMessageArguments = {
    text: '',
    channel: msg.channel,
  };

  const invalidNameText = 'User was not created. You must provide a name for the user. `!addPlayer <name>`';
  if (!name) {
    message.text = invalidNameText;
    client.chat.postMessage(message);
    return;
  }

  console.log('before post');
  const { data } = await axios.post('add-player', { name });
  console.log('after post');

  message.text = data;

  client.chat.postMessage(message);
};

const changeNickname: Action = async (
  client,
  msg,
  name,
  nickname,
) => {
  console.log('[changeNickname]');
  const message: ChatPostMessageArguments = {
    text: '',
    channel: msg.channel,
  };

  const invalidNameText = 'Nickname was not updated. You must provide the user\'s name and the intended nickname. `!changeNickname <name> <nickname>`';
  if (!name || !nickname) {
    message.text = invalidNameText;
    client.chat.postMessage(message);
    return;
  }

  const { data } = await axios.post('change-nickname', { name, nickname });

  message.text = data;

  client.chat.postMessage(message);
};

// const getStandings: Action = (
//   client,
//   msg,
//   args,
// ) => {

// };

const commands: Action = (
  client,
  msg,
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

export {
  addPlayer,
  changeNickname,
  commands,
};
