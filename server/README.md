# InfoBaseAPI
[![CircleCI](https://circleci.com/gh/TBS-EACPD/InfoBaseModern.svg?style=svg)](https://circleci.com/gh/TBS-EACPD/InfoBaseModern)

GraphQL API for InfoBase data. In development, and currently on pause.

## How to get started

### Testing with local GraphiQl

(After installing node ^9.0.0 and npm ^5.7.1)

* `npm ci`
* `npm start`
  * visit `http://localhost:1337` for GraphiQl instance
  

### Starting the app with docker

(After installing docker)

```bash
  docker build -t ib-api .
  docker images # test that it works, you should see at least 2 images: ib-api and node 9.2

  docker swarm init
  docker stack deploy -c docker-compose.yml
  # visit localhost:4000

  #to take down, 
  docker stack rm ib-api-multi
  docker swarm leave --force
```
  
  
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

