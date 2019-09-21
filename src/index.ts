import { IMessageEvent } from './types';
import { WebClient } from '@slack/web-api';
import bodyParser from 'body-parser';
import { createEventAdapter } from '@slack/events-api';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { executeCommand } from './helpers';
import express from 'express';

dotenv.config();

const CMD = process.env.COMMAND_INITIATOR;

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET!;
const token = process.env.SLACK_TOKEN;
const port = process.env.PORT || 3000;
const slackEvents = createEventAdapter(slackSigningSecret);
const client = new WebClient(token);

// Create an express application
const app = express();

// Plug the adapter in as a middleware
app.use('/', slackEvents.requestListener());

// Example: If you're using a body parser, always put it after the event adapter in the middleware stack
app.use(bodyParser());

// Initialize a server for the express app - you can skip this and the rest if you prefer to use app.listen()
const server = createServer(app);

server.listen(port, () => {
  // Log a message when the server is ready
  // @ts-ignore
  console.log(`Listening for events on ${server.address().port}`);
});

slackEvents.on('message', async (event: IMessageEvent) => {
  const { text } = event;

  // Early return if message is not a command
  if (text.charAt(0) !== CMD) { return; }

  executeCommand(event, client);
  
  return;
});