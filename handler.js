"use strict"

module.exports.hello = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Initial screen for movie app",
      },
      null,
      2
    ),
  }
}
