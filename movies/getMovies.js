const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb")
const { unmarshall } = require("@aws-sdk/util-dynamodb")
const { databaseName } = require("./env.js")

const getMovies = async () => {
  try {
    const client = new DynamoDBClient()

    const command = new ScanCommand({
      TableName: databaseName,
    })

    const result = await client.send(command)
    const movies = result.Items
      ? result.Items.map((item) => unmarshall(item))
      : []

    return {
      statusCode: 200,
      body: JSON.stringify(movies),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

module.exports = {
  getMovies,
}
