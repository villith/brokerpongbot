import { IActionEvent, IChannelListApiResult, IMessageEvent } from './types';
import { IActionResponse, Match } from '@team-scott/domain';
import { buildMatchMessage, executeCommand } from './helpers';

import { WebClient } from '@slack/web-api';
import axios from 'axios';
import bodyParser from 'body-parser';
import { createEventAdapter } from '@slack/events-api';
import { createMessageAdapter } from '@slack/interactive-messages';
import { createServer } from 'http';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

axios.defaults.baseURL = process.env.GCP_ROOT_URL;

const CMD = process.env.COMMAND_INITIATOR;

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET!;
const token = process.env.SLACK_TOKEN;
const port = process.env.PORT || 3000;
const slackEvents = createEventAdapter(slackSigningSecret);
const slackActions = createMessageAdapter(slackSigningSecret);
const client = new WebClient(token);
const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

const app = express();

app.use('/events', slackEvents.requestListener());
app.use('/actions', slackActions.requestListener());
app.use(bodyParser());

const server = createServer(app);

server.listen(port, async () => {
  // @ts-ignore
  console.log(`Listening for events on ${server.address().port}`);
  const { channels } = await client.channels.list() as IChannelListApiResult;
  const matchStatusChannel = channels.find(channel => channel.name === process.env.MATCH_STATUS_CHANNEL);
  
  if (matchStatusChannel) {
    const { messages } = await userClient.channels.history({ channel: matchStatusChannel.id });
    const promises = Object.values(messages as object).map(message => userClient.chat.delete({
      channel: matchStatusChannel.id,
      ts: message.ts,
    }));
    await Promise.all(promises);
 
    const { data } = await axios.get<IActionResponse<Match[]>>('getOngoingMatches');    
  
    if (data?.data?.length) {
      const message = await buildMatchMessage(userClient, matchStatusChannel.id, data?.data?.[0]);
      client.chat.postMessage(message);
    }
  }
});

slackEvents.on('message', (event: IMessageEvent) => {
  const { text } = event;

  // Early return if message is not a command
  if (text?.charAt(0) !== CMD) { return; }

  executeCommand(event, client);
  
  return;
});

slackActions.action('action', (payload: IActionEvent, res) => {
  console.dir(payload, { depth: null });
});
