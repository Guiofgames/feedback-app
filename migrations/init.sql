PRAGMA foreign_keys = ON;


CREATE TABLE IF NOT EXISTS reviews (
id TEXT PRIMARY KEY,
title TEXT NOT NULL,
comment TEXT NOT NULL,
rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
name TEXT,
email TEXT,
created INTEGER NOT NULL
);