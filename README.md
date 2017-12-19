# advweb-planner

SeoulTech advanced web programming (Fall 2017) term project

## Team Information (Team 3)

* 13109377 Eunbin Jeong

    Design, development, testing, documentation, &hellip;

## Project Overview

**Topic &mdash;** Planner application

**Purpose &mdash;** To create a useful planner application using web
technologies (HTML, CSS, JavaScript, Node.js, etc.)

### Architecture

```
+-----------+
| Server    |            +----------------------------+
| Node.js   | <--------> | Database                   |
| (Express) |            | MariaDB (MySQL-compatible) |
+-----------+            +----------------------------+
      ↑
      |                                     server side
......|................................................
      |                                     client side
      ↓
+---------------+
| Client        |
| HTML, CSS, JS |
| (jQuery)      |
+---------------+
```

## Starting the Server

1. Make sure Node.js, NPM, and MariaDB(or MySQL) are installed.

2. `cd` into the project and run `npm install` to install dependencies.

3. Create `config/config.json` to setup database connection and JWT.

    You can make a copy of `config/config-sample.json` to do it quickly.

4. Run `DEBUG=advweb-planner:* npm start`.

5. Open a web browser and go to `http://localhost:3000`.

## Dev Notes

Every notes I wrote down during the project are stored under `dev-note`
directory to aid the development and help you understand this project.

## License

Not decided yet.
