const {
  DynamoDBClient,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb")
const { marshall } = require("@aws-sdk/util-dynamodb")

const deleteMovie = async (event) => {
  try {
    const client = new DynamoDBClient()
    const { id } = event.pathParameters

    const params = {
      TableName: "MoviesTable",
      Key: marshall({ id }),
    }

    const command = new DeleteItemCommand(params)
    await client.send(command)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Movie deleted successfully",
      }),
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

module.exports = {
  deleteMovie,
}
