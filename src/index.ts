
import botApp from './apps/bot';
import adminApp from './apps/admin';
import { BotConfig } from './types';
import defaultModels from './models';
import express from 'express';

export const extendApp = (
  app: any,
  skills: { handle: Function; app?: any }[] = [],
  handle?: Function,
  config: BotConfig = {
    adminRoute: '/admin',
    botRoute: '/bot',
    models: {}
  }
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
    if (handle) {
      handled = await handle(event, handled);
    }
    for (const skill of skills) {
      if (skill.handle) {
        const result = await skill.handle(event, handled);
        handled = handled || result;
      }
    }
  };
  
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  
  if (process.env.RINGCENTRAL_CHATBOT_ADMIN_USERNAME && process.env.RINGCENTRAL_CHATBOT_ADMIN_PASSWORD) {
    app.use(
      config.adminRoute,
      adminApp(mergedHandle, conf)
    );
  }
  app.use(
    config.botRoute,
    botApp(mergedHandle, conf)
  );
  for (const skill of skills) {
    if (skill.app) {
      app.use('/', skill.app);
    }
  }
  (app as any).mergedHandle = mergedHandle; // for unit testing
  return app;
};

