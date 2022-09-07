import express from 'express';
import { BotConfig } from '../types'
import {botDeleted, postAdded, groupLeft} from '../handlers';
import {BotType} from '../types';

const createApp = (handle: Function, conf: BotConfig) => {
  const app = express();
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  const {Bot} = conf.models || {}
  app.all('/oauth', async (req, res) => {
    const bot = (await (Bot as any).init({
      code: req.query.code,
      token: req.body,
      creator_extension_id: req.query.creator_extension_id,
      creator_account_id: req.query.creator_account_id,
    })) as BotType;
    await bot.setupWebHook(); // this might take a while, depends on when the bot user is ready
    await handle({type: 'BotAdded', bot});
    res.status(200);
    res.send('ok'); // return string to fix issue for serverless-offline
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
          const result = await postAdded(Bot, message, conf);
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
          const groupType = message.body.type;
          await handle({
            type: 'BotJoinGroup',
            bot: joinGroupBot,
            group: {id: groupId, type: groupType },
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
