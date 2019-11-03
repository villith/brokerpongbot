import { WebClient } from "@slack/web-api";

const token = process.env.SLACK_TOKEN;
console.log(token);
const client = new WebClient(token);
const userClient = new WebClient(process.env.SLACK_USER_TOKEN);

export { client, userClient };
