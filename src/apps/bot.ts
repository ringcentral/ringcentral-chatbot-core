import express from 'express';
import { BotConfig } from '../types'
import {botDeleted, postAdded, groupLeft} from '../handlers';
import {BotType} from '../types';
import BotTable from '../models/Bot'
import bodyParser from 'body-parser'

const createApp = (handle: Function, conf: BotConfig) => {
  const app = express();
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  const {Bot} = conf.models || {
    Bot: BotTable
  }
  app.all('/oauth', async (req, res) => {
    const bot = (await (Bot as any).init({
      code: req.query.code,
      token: req.body,
    })) as BotType;
    await bot.setupWebHook(); // this might take a while, depends on when the bot user is ready
    await handle({type: 'BotAdded', bot});
    res.send('');
  });

  app.post('/webhook', async (req, res) => {
    const message = req.body;
    if (process.env.LOG_LEVEL === 'DEBUG') {
      console.log('WebHook payload:', JSON.stringify(message, null, 2));
    }
    const body = message.body;
    if (body) {
      switch (body.eventType) {
        case 'Delete': {
          const deleteBot = await botDeleted(Bot, message);
          await handle({type: 'BotRemoved', bot: deleteBot});
          break;
        }
        case 'PostAdded': {
          const result = await postAdded(Bot, message);
          if (result) {
            await handle({type: 'Message4Bot', ...result});
          }
          break;
        }
        case 'GroupLeft':
          const info = await groupLeft(message);
          await handle({
            type: 'BotGroupLeft',
            ...info
          });
          break;
        case 'GroupJoined': {
          const botId = message.ownerId;
          const joinGroupBot = await Bot.findByPk(botId);
          const groupId = message.body.id;
          await handle({
            type: 'BotJoinGroup',
            bot: joinGroupBot,
            group: {id: groupId},
          });
          break;
        }
        default:
          break;
      }
      await handle({type: body.eventType, message});
    }
    res.header('Validation-Token', req.header('Validation-Token'));
    res.send('');
  });

  return app;
};

export default createApp;
