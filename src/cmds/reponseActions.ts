import { ChatPostMessageArguments } from "@slack/web-api";
import { IActionResponse } from "@team-scott/domain";
import { ResponseActionFunction } from "../types";
import axios from "axios";
import { buildErrorMessage } from "../helpers";

const acceptChallenge: ResponseActionFunction = async (
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
