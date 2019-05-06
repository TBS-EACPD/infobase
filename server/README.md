# InfoBaseAPI

[![CircleCI](https://circleci.com/gh/TBS-EACPD/InfoBase.svg?style=svg&circle-token=a99b6b8309e5edd904b0386c4a92c10bf5f43e29)](https://circleci.com/gh/TBS-EACPD/InfoBase)

GraphQL API for InfoBase data. In development.

## How to get started

### Testing with local GraphiQl

(After installing node ^9.0.0, npm ^5.7.1, and mongo)

* leave `mongod` running in the background during development
* `npm ci`
* `npm run load_models`
* `npm run build`
* `npm start`
  * visit `http://localhost:1337` for GraphiQl instance

  
## File structure

### models/

* models are organized by area in `src/models/`
* each `src/models/<model_name>/` will contain 
  1. The model definitions
  2. Code to **populate** the models, usually fetching csv strings from `/data/`
  3. Schema definitions, both the schema string and the resolvers
    * This is the most complicated part, schema strings can use the `extend` keyword to add fields to other types
    * resolvers are merged deeply together so no need for special extend keywords 
  
  
## Cloud stuff

### Mongodb Atlas
TODO

### Google Cloud Function
TODO


## Roadmap

### Add ability to easily deal with gov-level information

#### With models
* some tables will need to use ZGOC `dept_code` to describe gov-level totals
 * would need to filter this row out often when doing org-level queries 

#### Through GraphQL 
 * `gov` as its own type and root field on the schema? 

### Add models, schema fields and population scripts for the remaining data

1. Tags and CRSOs
2. The rest of the IGOC fields
 * inst forms
 * schedules
 * ministers
 * ministries
3. Public accounts v/s items (table4)
4. Estimates v/s items (table8)
5. Transfer Payments (table7)
6. People data
 * average age
7. QFRs
 * Vote stat (table1)
 * Standard objects (table2)

### Create a search field that searches most of the data 

### Best practices/optimizations to keep in mind 
* Use graphQL enums over plain strings
* see if we can take advantage of the read-only nature of our data

