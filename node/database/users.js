import * as db from '../loaders/postgres.js';

/**
 * Add a new user to the database.
 * @param {string} first_name
 * @param {string} last_name
 * @param {number} age
 */
export const addNewUser = async (first_name, last_name, age) => {
  await db.query('INSERT INTO users VALUES ($1, $2, $3)', [first_name, last_name, age]);
  return true;
}

/**
 * Get all users having first_name = `first_name`.
 * @param {string} first_name
 * @returns {Promise<Array<{first_name: string, last_name: string, age: number}>>}
 */
export const getUsersByFirstName = async (first_name) => {
  const result = await db.query(
    'SELECT first_name, last_name, age FROM users WHERE first_name=$1',
    [first_name],
  );
  return result.rows;
}