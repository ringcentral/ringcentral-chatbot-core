# RingCentral chatbot framework Core module

This is a fork of [https://github.com/ringcentral/ringcentral-chatbot-js](https://github.com/ringcentral/ringcentral-chatbot-js), the goal is put bot logic into one standalone module so add-in framework or other project can use it.

## How to use

```js
import { extendApp } from 'ringcentral-chatbot-core'
import express from 'express'

function eventHandler ({
    type, // could be 'BotRemoved', 'Message4Bot', 'Message4Others', 'BotGroupLeft', 'BotJoinGroup', 'Maintain', 'SetupDatabase'
    bot, // the bot instance, check src/models/Bot.ts for instance methods
    text, // the text message user posted in chatgroup
    group, // the group object, can get chat group id from group.id
    userId, // message creator's id
    isPrivateChat, // if it is a private chat
    message, // message object, check ringcentral api document for detail
    commandLineOptions, // only if set commandLineConfigs in botConfig, would get parse result from text, check doc/command-line-parser.md for detail
}) {
    console.log(
        type,
        bot,
        text,
        group,
        userId,
        message
    )

  // bot.sendMessage(groupId, body)
  if (type === 'BotJoinGroup') {
    await bot.sendAdaptiveCard(group.id, {
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      type: 'AdaptiveCard',
      version: '1.3',
      body: [
        {
          type: 'TextBlock',
          text: 'hello!',
          size: 'large'
        },
        {
          type: 'TextBlock',
          text: 'I am a chat bot',
          weight: 'bolder'
        }
      ]
    })
    // or send text message
    // await bot.sendMessage(group.id, {
    //   text: 'welcome'
    // })
  } else if (type === 'Message4Bot') {
    await bot.sendAdaptiveCard(group.id, {
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      type: 'AdaptiveCard',
      version: '1.3',
      body: [
        {
          type: 'TextBlock',
          text: 'hello!',
          size: 'large'
        },
        {
          type: 'TextBlock',
          text: 'You posted: ' + text,
          weight: 'bolder'
        }
      ]
    })
    // or send text message
    // await bot.sendMessage(group.id, {
    //   text: 'hi'
    // })
  }
}

const botConfig = {
    adminRoute: '/admin', // optional
    botRoute: '/bot', // optional
    models: { // optional
        Bot: 'your bot data model defination' // check src/models/Bot.ts as a example, optional
    },
    commandLineConfigs: [ // optional
      {
        command: 'add'
        options: [
          ['-f, --float <number>', 'float argument'],
          ['-i, --integer <number>', 'integer argument'],
          ['-v, --verbose', 'verbosity that can be increased']
        ]
      }
    ]
    // if set commandLineConfigs in botConfig, would get parsed commandLineOptions object from text, check doc/command-line-parser.md for detail(use commander module)
}

let app = express()
const skills = []
app = extendApp(app, skills, eventHandler, botConfig)
app.listen(3000, () => {
    console.log('server running')
})
```

## Exposed routes

- `/{botConfig.adminRoute}/{routePath}`: check [src/apps/admin.ts](src/apps/admin.ts) for routes detail
- `/{botConfig.botRoute}/{routePath}`: check [src/apps/bot.ts](src/apps/bot.ts) for routes detail

## Bot instance methods

Check [src/models/Bot.ts](src/models/Bot.ts) for details.

## Params controlled by ENV

```js
 // default is true, can be set to false
process.env.DYNAMO_SAVE_UN_KNOWN=true

// default is false, can be set to true
process.env.DYNAMO_SAVE_JSON_AS_OBJECT=false

// default is false, can be set to true
process.env.USE_HEROKU_POSTGRES = false

// set db url
RINGCENTRAL_CHATBOT_DATABASE_CONNECTION_URI = 'sqlite:///file/db.sql'

// when set to 'dynamo', process.env.RINGCENTRAL_CHATBOT_DATABASE_CONNECTION_URI will be ignored
process.env.DIALECT = 'dynamo'
```

## More details

Check [https://github.com/ringcentral/ringcentral-chatbot-js](https://github.com/ringcentral/ringcentral-chatbot-js)

## demos

- [https://github.com/ringcentral/demo-bot-poly](https://github.com/ringcentral/demo-bot-poly)

## License

MIT
