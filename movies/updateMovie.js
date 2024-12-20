const {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb")
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb")
const { databaseName } = require("./env.js")

const updateMovie = async (event) => {
  try {
    const client = new DynamoDBClient()
    const { id } = event.pathParameters

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Movie ID is required" }),
      }
    }

    // Check if the movie exists
    const getItemParams = {
      TableName: databaseName,
      Key: marshall({ id }),
    }
    const getItemCommand = new GetItemCommand(getItemParams)
    const record = await client.send(getItemCommand)

    const movie = record.Item ? unmarshall(record.Item) : null

    if (!movie) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Movie ID does not exist" }),
      }
    }

    const { title, director, year } = JSON.parse(event.body)
    const modifiedAt = new Date().toISOString()

    const expressionAttributeValues = {
      ":modifiedAt": modifiedAt,
    }
    const expressionAttributeNames = {}
    let updateExpression = "set modifiedAt = :modifiedAt"

    if (title !== undefined) {
      expressionAttributeValues[":title"] = title
      expressionAttributeNames["#title"] = "title"
      updateExpression += ", #title = :title"
    }

    if (director !== undefined) {
      expressionAttributeValues[":director"] = director
      expressionAttributeNames["#director"] = "director"
      updateExpression += ", #director = :director"
    }

    if (year !== undefined) {
      expressionAttributeValues[":year"] = year
      expressionAttributeNames["#year"] = "year"
      updateExpression += ", #year = :year"
    }

    const params = {
      TableName: databaseName,
      Key: marshall({ id }, { removeUndefinedValues: true }),
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues, {
        removeUndefinedValues: true,
      }),
      ReturnValues: "ALL_NEW",
    }

    const command = new UpdateItemCommand(params)
    const result = await client.send(command)
    const updatedMovie = result.Attributes
      ? unmarshall(result.Attributes)
      : null

    return {
      statusCode: 200,
      body: JSON.stringify(updatedMovie),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

module.exports = {
  updateMovie,
}
