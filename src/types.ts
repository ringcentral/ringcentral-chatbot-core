import RingCentral from '@rc-ex/core';

export type BotType = {
  id: string;
  check: Function;
  ensureWebHook: Function;
  getSubscriptions: Function;
  setupWebHook: Function;
  remove: Function;
  getGroup: Function;
  rename: Function;
  setAvatar: Function;
  toJSON: Function;
  token: any;
  rc: RingCentral;
  updateToken: Function;
  sendMessage: Function;
  sendAdaptiveCard: Function;
  updateAdaptiveCard: Function;
};

export type Message = {
  body: {
    id: string;
    extensionId: string;
    text: string;
    creatorId: string;
    groupId: string;
    mentions:
      | null
      | {
          id: string;
          type: string;
        }[];
    attachments?: AttachmentType[];
  };
  ownerId: string;
};

export type AttachmentType = {
  type: string;
  contentUri: string;
  name: string;
};

export interface BotConfig {
  adminRoute: string,
  botRoute: string,
  models?: any,
  setupDatabase?: Function
}
