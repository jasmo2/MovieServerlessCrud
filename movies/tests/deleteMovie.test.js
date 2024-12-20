const { deleteMovie } = require("../deleteMovie")
const {
  DynamoDBClient,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb")
const { marshall } = require("@aws-sdk/util-dynamodb")
const { v4: uuidv4 } = require("uuid")

jest.mock("@aws-sdk/client-dynamodb")
jest.mock("@aws-sdk/util-dynamodb")

describe("deleteMovie", () => {
  beforeAll(() => {
    DynamoDBClient.mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation((command) => {
          if (command instanceof DeleteItemCommand) {
            return Promise.resolve({})
          }
        }),
      }
    })

    marshall.mockImplementation((item) => item)
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it("should delete a movie and return status code 200", async () => {
    const event = {
      pathParameters: {
        id: uuidv4(),
      },
    }

    const result = await deleteMovie(event)

    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body).message).toBe("Movie deleted successfully")
  })

  it("should return status code 500 on error", async () => {
    DynamoDBClient.mockImplementationOnce(() => {
      return {
        send: jest.fn().mockImplementation((command) => {
          if (command instanceof DeleteItemCommand) {
            return Promise.reject(new Error("DynamoDB error"))
          }
        }),
      }
    })

    const event = {
      pathParameters: {
        id: uuidv4(),
      },
    }

    const result = await deleteMovie(event)

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body).error).toBe("DynamoDB error")
  })
})
