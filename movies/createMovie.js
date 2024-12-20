const { v4 } = require("uuid")
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb")
const { marshall } = require("@aws-sdk/util-dynamodb")
const { databaseName } = require("./env.js")

const createDynamoDBClient = () => {
  return new DynamoDBClient()
}

const createNewMovie = (title, director, year) => {
  const createAt = new Date().toISOString() // Convert Date to string
  const id = v4()

  return {
    id,
    title,
    director,
    year,
    createAt,
    modifiedAt: createAt,
  }
}

const addMovieToDB = async (client, newMovie) => {
  const command = new PutItemCommand({
    TableName: databaseName,
    Item: marshall(newMovie),
  })

  await client.send(command)
}

const createMovie = async (event) => {
  try {
    const client = createDynamoDBClient()
    const { title, director, year } = JSON.parse(event.body)
    const newMovie = createNewMovie(title, director, year)

    await addMovieToDB(client, newMovie)

    return {
      statusCode: 201,
      body: JSON.stringify(newMovie),
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
  createMovie,
}
