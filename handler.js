'use strict';

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

module.exports.patients = async (event) => {
  try {
    if (event.pathParameters && event.pathParameters.id) {
      const id = event.pathParameters.id;
      const params = {
        TableName: tableName,
        Key: {
          id: id
        }
      };
      const result = await dynamoDB.get(params).promise();
      if (!result.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Paciente não encontrado' })
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item)
      };
    } else {
      const params = {
        TableName: tableName
      };
      const result = await dynamoDB.scan(params).promise();
      return {
        statusCode: 200,
        body: JSON.stringify(result.Items)
      };
    }
  } catch (error) {
    console.error('Error retrieving data from DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro ao recuperar dados do DynamoDB',
        error: error.message
      })
    };
  }
};

module.exports.createPatient = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { id, nome, anoNascimento, genero } = requestBody;
    if (!id || !nome || !anoNascimento || !genero) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Todos os campos são obrigatórios' })
      };
    }
    const params = {
      TableName: tableName,
      Item: {
        id: id,
        nome: nome,
        anoNascimento: anoNascimento,
        genero: genero
      }
    };
    await dynamoDB.put(params).promise();
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Paciente criado com sucesso' })
    };
  } catch (error) {
    console.error('Error creating patient:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Erro ao criar paciente',
        error: error.message
      })
    };
  }
};