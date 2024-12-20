const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb")
const { unmarshall } = require("@aws-sdk/util-dynamodb")
const { databaseName } = require("./env.js")

const getMovie = async (event) => {
  try {
    const client = new DynamoDBClient()
    const { id } = event.pathParameters

    const command = new GetItemCommand({
      TableName: databaseName,
      Key: {
        id: { S: id },
      },
    })

    const result = await client.send(command)
    const movie = result.Item ? unmarshall(result.Item) : null

    return {
      statusCode: 200,
      body: JSON.stringify(movie),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

module.exports = {
  getMovie,
}
