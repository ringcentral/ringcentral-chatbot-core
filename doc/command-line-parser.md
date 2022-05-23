```js
function myParseInt(value, dummyPrevious) {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new commander.InvalidArgumentError('Not a number.');
  }
  return parsedValue;
}

function increaseVerbosity(dummyValue, previous) {
  return previous + 1;
}

function collect(value, previous) {
  return previous.concat([value]);
}

function commaSeparatedList(value, dummyPrevious) {
  return value.split(',');
}

const botConfig = {
    adminRoute: '/admin', // optional
    botRoute: '/bot', // optional
    models: { // optional
        Bot: 'your bot data model defination' // check src/models/Bot.ts as a example, optional
    },
    commandLineConfigs: { // optional
      {
        command: 'adjust'
        options: [
          ['-f, --float <number>', 'float argument', parseFloat],
          ['-i, --integer <number>', 'integer argument', myParseInt],
          ['-v, --verbose', 'verbosity that can be increased', increaseVerbosity, 0],
          ['-c, --collect <value>', 'repeatable value', collect, []],
          ['-l, --list <items>', 'comma separated list', commaSeparatedList]
        ]
      },
      {
        command: 'list' // this command no option
      },
      {
        command: 'add' // this command no option
      }
    }
    // if set commandLineConfigs in botConfig, would get parsed options object from text, check doc/command-line-parser.md for detail
}


function eventHandler ({
    type, // could be 'BotRemoved', 'Message4Bot', 'Message4Others', 'BotGroupLeft', 'BotJoinGroup', 'Maintain', 'SetupDatabase'
    bot, // the bot instance, check src/models/Bot.ts for instance methods
    text, // the text message user posted in chat group
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
  // when text === 'list'
  expect(commandLineOptions).tobeEqual({
    command: 'list',
    rest: ''
  })
  // when text = 'add more text desc'
  expect(commandLineOptions).tobeEqual({
    command: 'add',
    rest: 'more text desc',
    options: {
      verbose: 0,
      collect: []
    }
  })
  // when text = 'adjust -f 5.8 -i 5654 some other not related text '
  expect(commandLineOptions).tobeEqual({
    command: 'add',
    rest: ' -f 5.8 -i 5654 some other not related text ',
    options: {
      verbose: 0,
      collect: [],
      integer: 5654,
      float: 5.8
    }
  })
}
```