const {
  DynamoDBClient,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb")
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb")

const updateMovie = async (event) => {
  try {
    const client = new DynamoDBClient()
    const { id } = event.pathParameters
    const { title, director, year } = JSON.parse(event.body)
    const modifiedAt = new Date().toISOString()

    const expressionAttributeValues = {
      ":title": title,
      ":director": director,
      ":modifiedAt": modifiedAt,
      ":year": year,
    }

    const ExpressionAttributeValues = marshall(expressionAttributeValues, {
      removeUndefinedValues: true,
    })
    console.log(
      "TCL ~ updateMovie ~ ExpressionAttributeValues:",
      ExpressionAttributeValues
    )

    const params = {
      TableName: "MoviesTable",
      Key: marshall({ id }),
      UpdateExpression:
        "set #title = :title, #director = :director, #year = :year, modifiedAt = :modifiedAt",
      ExpressionAttributeNames: {
        "#title": "title",
        "#director": "director",
        "#year": "year",
      },
      ExpressionAttributeValues,
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
