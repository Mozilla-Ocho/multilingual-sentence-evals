# Computing sentence categories using Large Language Models and Formulaic

A summary of interesting statsistics is available on the (Statistics)[/Statistics.md] page.

## Quick start:

Looking to run full benchmarking suite? Heres how:

1. `git clone` project locally
2. ensure node is installed/accessible
3. create [Formulaic](https:formulaic.app) account
   a. create [Formulaic API](https:formulaic.app/profile) key
4. copy `env-template` to a new file named `.env`
5. add env values (e.g. API key)
6. run `npm install` to install dependencies
7. run `npm start` to fetch all the data and store it in SQLite database

## Start using data (no keys required)

Computed results (aka the data from the LLMs) is stored in `./cv-sentence.db` in a SQLite file that can be accesses using any SQLite-compatible client.

The database has a table called `sentence_domains` with the schema like:

```
value TEXT
user_domain TEXT
total_tokens INTEGER
model TEXT
id INTEGER
created_at DATE
computed_domain TEXT
```

## Recreate Statistics.md

New data? Get new insights by running `npm run generate-stats` which creates an easy-to-read markdown file with a series of tables (see `queries/`)
