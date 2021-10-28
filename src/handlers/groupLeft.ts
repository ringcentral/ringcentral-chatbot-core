import {Message} from '../types';

export const groupLeft = async (message: Message) => {
  const botId = message.ownerId;
  const groupId = message.body.id;
  console.log('bot id:', botId, 'leaves group id', groupId)
  return {
    bot: {
      id: botId
    },
    group: {
      id: groupId
    }
  }
};
