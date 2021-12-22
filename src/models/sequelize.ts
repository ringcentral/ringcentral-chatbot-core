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
  config = {
    define: {
      timestamps: true
    },
    logging: false,
    dialect: ''
  }

  if (process.env.DIALECT === 'dynamodb') {
    config.dialect = 'dynamo'
  }
}

const sequelize = new Sequelize(
  process.env.RINGCENTRAL_CHATBOT_DATABASE_CONNECTION_URI,
  config
)

export default sequelize