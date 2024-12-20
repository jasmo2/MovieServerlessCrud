const { createMovie } = require("../createMovie")
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb")
const { marshall } = require("@aws-sdk/util-dynamodb")
const { v4: uuidv4 } = require("uuid")

jest.mock("@aws-sdk/client-dynamodb")
jest.mock("@aws-sdk/util-dynamodb")
jest.mock("uuid")

describe("createMovie", () => {
  beforeAll(() => {
    DynamoDBClient.mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation((command) => {
          if (command instanceof PutItemCommand) {
            return Promise.resolve({})
          }
        }),
      }
    })

    marshall.mockImplementation((item) => item)
    uuidv4.mockReturnValue("84a35bbf-a204-4c52-83ba-8e831d02e2a5")
    jest.spyOn(global, "Date").mockImplementation(() => ({
      toISOString: () => "2024-12-20T01:53:27.674Z",
    }))
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it("should create a movie and return status code 201", async () => {
    const event = {
      body: JSON.stringify({
        title: "Inception",
        director: "Christopher Nolan",
        year: 2010,
      }),
    }

    const result = await createMovie(event)

    expect(result.statusCode).toBe(201)
    expect(JSON.parse(result.body)).toEqual({
      createAt: "2024-12-20T01:53:27.674Z",
      director: "Christopher Nolan",
      id: "84a35bbf-a204-4c52-83ba-8e831d02e2a5",
      modifiedAt: "2024-12-20T01:53:27.674Z",
      title: "Inception",
    })
  })

  it("should return status code 500 on error", async () => {
    DynamoDBClient.mockImplementationOnce(() => {
      return {
        send: jest.fn().mockImplementation((command) => {
          if (command instanceof PutItemCommand) {
            return Promise.reject(new Error("DynamoDB error"))
          }
        }),
      }
    })

    const event = {
      body: JSON.stringify({
        title: "Inception",
        director: "Christopher Nolan",
        year: 2010,
      }),
    }

    const result = await createMovie(event)

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body).error).toBe("DynamoDB error")
  })
})
