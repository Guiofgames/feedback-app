const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');


const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.sqlite');


if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });


const db = new Database(DB_FILE);


function migrate(){
const initSql = fs.readFileSync(path.join(__dirname, 'migrations', 'init.sql'), 'utf8');
db.exec(initSql);
console.log('Migration executed.');
}


module.exports = { db, migrate };