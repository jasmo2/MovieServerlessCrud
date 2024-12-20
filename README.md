<!--
title: 'Serverless Framework Node Express API on AWS'
description: 'This template demonstrates how to develop and deploy a simple Node Express API running on AWS Lambda using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Movies Serverless CRUD

This project demonstrates how to develop and deploy a simple Node.js-based movie management API service running on AWS Lambda using the Serverless Framework. The API allows you to create, read, update, and delete movie records stored in a DynamoDB table.

## Video explanation
https://www.loom.com/share/d0a78bf386034cae9e720a14a8941d1b

## Project Structure

- **handler.js**: Contains the main entry point for the API.
- **movies/**: Directory containing Lambda functions for handling movie-related operations:
  - `createMovie.js`: Function to create a new movie.
  - `deleteMovie.js`: Function to delete a movie by ID.
  - `getMovie.js`: Function to get a movie by ID.
  - `getMovies.js`: Function to get all movies.
  - `updateMovie.js`: Function to update a movie by ID.
- **.serverless/**: Directory containing Serverless Framework deployment artifacts.
- **.github/**: GitHub workflows for CI/CD.
- **serverless.yml**: Serverless Framework configuration file.
- **package.json**: Node.js project dependencies and scripts.

## Usage

### Deployment

Install dependencies with:

```sh
npm install