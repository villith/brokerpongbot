import { ChatPostMessageArguments, ChatUpdateArguments } from "@slack/web-api";
import { IChannelListApiResult, ResponseActionFunction } from "../types";

import { IActionResponse } from "@team-scott/domain";
import axios from "axios";
import { buildErrorMessage } from "../helpers";

const acceptChallenge: ResponseActionFunction = async (
  client,
  details,
) => {
  const responseMessage: ChatUpdateArguments = {
    text: '',
    channel: details.channel.id,
    ts: details.message.ts,
  };

  const { data } = await axios.post<IActionResponse<{ announcement: string }>>('challenge-response', {
    matchId: details.action.value,
    type: details.action.action_id,
    slackId: details.user.id,
  });

  if (data.error) {
    const errorMessage = buildErrorMessage(details.channel.id, data);
    client.chat.postMessage(errorMessage);
    return;
  }

  responseMessage.text = data.details;

  const { channels } = await client.channels.list() as IChannelListApiResult;
  const challengeChannel = channels.find(channel => channel.name === process.env.CHALLENGE_CHANNEL);

  if (challengeChannel) {
    const channelMessage: ChatPostMessageArguments = {
      text: data.data?.announcement!,
      mrkdwn: true,
      blocks: [],
      channel: challengeChannel.id,
    }
    client.chat.postMessage(channelMessage);
  }

  console.dir(responseMessage);

  client.chat.update(responseMessage);
  client.chat.postMessage(responseMessage);
};

const declineChallenge: ResponseActionFunction = async (
  client,
  details,
) => {
  const message: ChatPostMessageArguments = {
    text: '',
    channel: details.channel.id,
  };

  const { data } = await axios.post<IActionResponse>('challenge-response', {
    matchId: details.action.value,
    type: details.action.action_id,
    slackId: details.user.id,
  });

  if (data.error) {
    const errorMessage = buildErrorMessage(details.channel.id, data);
    client.chat.postMessage(errorMessage);
    return;
  }

  message.text = data.details;

  client.chat.postMessage(message);
};

export {
  acceptChallenge,
  declineChallenge,
}
