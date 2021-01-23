import pg from 'pg';

const pool = new pg.Pool();
if (process.env.NODE_ENV !== 'testing') console.log('Pool created');

export const client = () => pool.connect();
export const query = (text, params) => pool.query(text, params);

query(
  `CREATE TABLE IF NOT EXISTS users (
    first_name varchar(100) not null,
    last_name varchar(100) not null,
    age smallserial not null
  )`,
  [],
);
