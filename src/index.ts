
import botApp from './apps/bot';
import adminApp from './apps/admin';
import { BotConfig } from './types';
import defaultModels from './models';
import express from 'express';
export const extendApp = (
  app: any,
  skills: { handle: Function; app?: any }[] = [],
  config: BotConfig
) => {
  const conf = {
    ...config,
    models: Object.assign({}, defaultModels, config.models || {})
  }

  conf.setupDatabase = async (force = false) => {
    for (const modelName in conf.models) {
      await conf.models[modelName].sync({ force });
    }
  };
  const mergedHandle = async (event: any) => {
    let handled = false;
    if (config.bot.handler) {
      handled = await config.bot.handler(event, handled);
    }
    for (const skill of skills) {
      if (skill.handle) {
        const result = await skill.handle(event, handled);
        handled = handled || result;
      }
    }
  };

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    config.admin.route,
    adminApp(mergedHandle, conf)
  );
  app.use(
    config.bot.route,
    botApp(mergedHandle, conf)
  );
  for (const skill of skills) {
    if (skill.app) {
      app.use('/', skill.app);
    }
  }
  (app as any).mergedHandle = mergedHandle; // for unit testing
  console.log('server running...');
  console.log(`- bot oauth uri:\n${process.env.RINGCENTRAL_CHATBOT_SERVER}${config.bot.route}/oauth`);
  console.log(`- interactive message uri:\n${process.env.RINGCENTRAL_CHATBOT_SERVER}${config.card.route}`);
  console.log(`- admin uri:\n${process.env.RINGCENTRAL_CHATBOT_SERVER}${config.admin.route}`);
  return app;
};

