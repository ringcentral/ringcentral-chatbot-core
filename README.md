# RingCentral chatbot framework Core module

## Status: work in progress

This is a fork of [https://github.com/ringcentral/ringcentral-chatbot-js](https://github.com/ringcentral/ringcentral-chatbot-js), the goal is put bot logic into one standalone module so add-in framework or other project can use it.

## How to use

```js
import { extendApp } from 'ringcentral-chatbot-core'
import express from 'express'

function eventHandler ({
    type，// could be 'Delete', 'PostAdded', 'GroupLeft', 'GroupJoined', 'Maintain', 'SetupDatabase'
    bot, // the bot instance, check src/models/Bot.ts for instance methods
    text, // the text message user posted in chatgroup
    group, // the group object, can get chat group id from group.id
    userId, // message creator's id
    message // message object, check ringcentral api document for detail
}) {
    console.log(
        type，
        bot,
        text,
        group,
        userId,
        message
    )

    // bot.sendMessage(groupId, body)
    // bot.sendAdaptiveCard(groupId, body)
    // bot.updateAdaptiveCard(postId, body)
}

const botConfig = {
    adminRoute: '/admin', // optional
    botRoute: '/bot', // optional
    models: { // optional
        Bot: 'your bot data model defination' // check src/models/Bot.ts as a example, optional
    }
}

const app = express()
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

## More details:

Check [https://github.com/ringcentral/ringcentral-chatbot-js](https://github.com/ringcentral/ringcentral-chatbot-js)

## License

MIT
