import basicAuth from 'express-basic-auth';
import { BotConfig } from '../types'
import express from 'express';
import {BotType} from '../types';

const createApp = (handle: Function, conf: BotConfig) => {
  const app = express();
  const {Bot} = conf.models || {}
  const {setupDatabase = () => null} = conf
  app.use(
    basicAuth({
      users: {
        [process.env.RINGCENTRAL_CHATBOT_ADMIN_USERNAME!]:
          process.env.RINGCENTRAL_CHATBOT_ADMIN_PASSWORD!,
      },
      unauthorizedResponse: () => '401 Unauthorized',
    })
  );

  // create database tables
  // ?force=true to delete existing tables
  app.put('/setup-database', async (req: any, res: any) => {
    await setupDatabase(req.query.force === 'true');
    await handle({type: 'SetupDatabase'});
    res.send('');
  });

  app.put('/update-token', async (req: any, res: any) => {
    const bot = (await Bot.findByPk(
      req.query.id as string
    )) as unknown as BotType;
    if (bot !== null) {
      await bot.updateToken((req.query.token as string).trim());
    }
    res.send('');
  });

  // "maintain": remove dead bots from database, ensure live bots have WebHooks, destroy very old cache data
  app.put('/maintain', async (req: any, res: any) => {
    const bots = (await Bot.findAll()) as unknown as BotType[];
    for (const bot of bots) {
      if (await bot.check()) {
        await bot.ensureWebHook();
      }
    }
    await handle({type: 'Maintain'});
    res.send('');
  });

  // provide administrator with database data for troubleshooting
  app.get('/dump-database', async (req: any, res: any) => {
    const bots = await Bot.findAll()
    res.send(bots);
  });

  // provide administrator with subscriptions data for troubleshooting
  app.get('/list-subscriptions', async (req: any, res: any) => {
    const bots = (await Bot.findAll()) as unknown as BotType[];
    let result = '';
    for (const bot of bots) {
      result += '*****************\n';
      const subscriptions = await bot.getSubscriptions();
      result += `<pre>\n${JSON.stringify(subscriptions, null, 2)}\n</pre>\n`;
      result += '*****************\n';
    }
    res.send(result);
  });

  // create db tables if not exist
  setupDatabase();

  return app;
};

export default createApp;
