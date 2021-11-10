// @ts-ignore
import Sequelize from 'dynamo-sequelize'

const config = {
  define: {
    timestamps: true
  },
  logging: false,
  dialect: ''
}

if (process.env.DIALECT === 'dynamodb') {
  config.dialect = 'dynamo'
}

const sequelize = new Sequelize(
  process.env.RINGCENTRAL_CHATBOT_DATABASE_CONNECTION_URI,
  config
)

export default sequelize