import { IMessageEvent, IResponseAction } from './types';
import { executeCommand, handleUserResponse, refreshCurrentMatches } from './helpers';

import { WebClient } from '@slack/web-api';
import axios from 'axios';
import bodyParser from 'body-parser';
import { createEventAdapter } from '@slack/events-api';
import { createMessageAdapter } from '@slack/interactive-messages';
import { createServer } from 'http';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';

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

app.use(morgan('dev'));
app.use('/events', slackEvents.requestListener());
app.use('/actions', slackActions.requestListener());
app.use(bodyParser());

const server = createServer(app);

server.listen(port, async () => {
  // @ts-ignore
  console.log(`Listening for events on ${server.address().port}`);
  await refreshCurrentMatches(client, userClient);
});

slackEvents.on('message', async (event: IMessageEvent) => {
  const { text } = event;

  // Early return if message is not a command
  if (text?.charAt(0) !== CMD) { return; }

  await executeCommand(event, client, userClient);
});

slackActions.action({}, (payload: IResponseAction, res) => {
  handleUserResponse(payload, client);
});
