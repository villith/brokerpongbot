import dotenv from 'dotenv';
dotenv.config();

import { IMessageEvent, IResponseAction } from './types';
import { executeCommand, handleUserResponse, refreshCurrentMatches } from './helpers';

import axios from 'axios';
import bodyParser from 'body-parser';
import { createEventAdapter } from '@slack/events-api';
import { createMessageAdapter } from '@slack/interactive-messages';
import { createServer } from 'http';
import express from 'express';
import morgan from 'morgan';

axios.defaults.baseURL = process.env.GCP_ROOT_URL;

const CMD = process.env.COMMAND_INITIATOR;

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET!;
const port = process.env.PORT || 3000;
const slackEvents = createEventAdapter(slackSigningSecret);
const slackActions = createMessageAdapter(slackSigningSecret);

const app = express();

app.use(morgan('dev'));
app.use('/events', slackEvents.requestListener());
app.use('/actions', slackActions.requestListener());
app.use(bodyParser());

const server = createServer(app);

server.listen(port, async () => {
  try {
    // @ts-ignore
    console.log(`Listening for events on ${server.address().port}`);
    await refreshCurrentMatches();
  } catch (err) {
    console.log('server listen');
    console.log(err);
  }
});

slackEvents.on('message', async (event: IMessageEvent) => {
  try {
    const { text } = event;

    // Early return if message is not a command
    if (text?.charAt(0) !== CMD) { return; }

    await executeCommand(event);
  } catch (err) {
    console.log('on msg');
    console.log(err);
    console.trace();
  }
});

slackActions.action({}, (payload: IResponseAction, res) => {
  handleUserResponse(payload);
});
