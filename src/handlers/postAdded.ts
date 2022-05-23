import axios from 'axios';
import {BotType, Message, BotConfig} from '../types';
import commandParser from './command-line-parser'

export const postAdded = async (Bot: any, message: Message, conf: BotConfig) => {
  const originalText = message.body.text;
  if (!originalText) {
    return; // not a text message
  }
  const botId = message.ownerId;
  const userId = message.body.creatorId;
  if (botId === userId) {
    return; // bot should not talk to itself to avoid dead-loop conversation
  }
  const groupId = message.body.groupId;
  const bot = (await Bot.findByPk(botId)) as unknown as BotType;
  if (!bot) {
    return;
  }
  const group = await bot.getGroup(groupId);
  const isPrivateChat = group.members.length <= 2;
  if (
    !isPrivateChat &&
    (message.body.mentions === null ||
      !message.body.mentions.some(m => m.type === 'Person' && m.id === botId))
  ) {
    return {
      text: originalText,
      group,
      bot,
      userId,
      isPrivateChat,
      message: message.body,
      type: 'Message4Others'
    };
  }
  const regex = new RegExp(`!\\[:Person\\]\\(${bot.id}\\)`);
  const text = originalText.replace(regex, ' ').trim();
  if (text.startsWith('__rename__')) {
    await bot.rename(text.substring(10).trim());
    return;
  }
  if (text === '__setAvatar__') {
    if ((message.body.attachments || []).length === 0) {
      return;
    }
    const attachment = message.body.attachments![0];
    const r = await axios.get(attachment.contentUri, {
      responseType: 'arraybuffer',
    });
    await bot.setAvatar(r.data, attachment.name);
    return;
  }
  if (text.startsWith('__updateToken__')) {
    await bot.updateToken(text.substring(15).trim());
    return;
  }
  const result: any = {
    originalText,
    text,
    group,
    bot,
    userId,
    isPrivateChat,
    message:
    message.body
  };
  if (conf.commandLineConfigs) {
    const commandLineOptions = commandParser(text, conf.commandLineConfigs)
    result.commandLineOptions = commandLineOptions
  }
  return result
};
