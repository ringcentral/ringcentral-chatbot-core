// @ts-ignore
import Sequelize from 'dynamo-sequelize'

let config;
if (process.env.USE_HEROKU_POSTGRES) {
  config =
  {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  }
}
else {
  let saveUnknown: any = process.env.DYNAMO_SAVE_UN_KNOWN
  const jsonAsObject: any = process.env.DYNAMO_SAVE_JSON_AS_OBJECT || false
  saveUnknown = saveUnknown === false || saveUnknown === 'false' ? false : true
  config = {
    define: {
      saveUnknown,
      timestamps: true,
      jsonAsObject
    },
    logging: false,
    dialect: ''
  }

  if (process.env.DIALECT === 'dynamodb') {
    config.dialect = 'dynamo'
  }
}

const sequelize = new (Sequelize as any)(
  process.env.RINGCENTRAL_CHATBOT_DATABASE_CONNECTION_URI,
  config
)

export default sequelize as any