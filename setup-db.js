const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306,
    });
    
    await connection.query('CREATE DATABASE IF NOT EXISTS `moda_mastou`;');
    console.log('Database moda_mastou created or already exists.');
    
    await connection.end();
  } catch (error) {
    console.error('Failed to create database:', error);
  }
}

createDatabase();
