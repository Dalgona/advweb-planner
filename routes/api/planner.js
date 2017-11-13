/*
 * routes/api/planner
 * This module exposes API endpoints related to manipulating planners.
 */

var env = process.env.NODE_ENV || 'development';

const express = require('express');
const ejwt = require('express-jwt');

const config = require('../../config/config.json')[env];
const error = require('../../api/error');
const apiPlanner = require('../../api/planner');
const apiSchedule = require('../../api/schedule');
const apiTodoList = require('../../api/todo-list');

const router = express.Router();

router.use(ejwt({ secret: config.jwtSecret }));

/*
 * GET /planner
 * Gets a list of planners the current user owns.
 */
router.get('/', (req, res, next) => {
  const stripUser = req.query.stripUser === 'true';
  apiPlanner
  .getAll(req.user)
  .then(result => {
    Promise.all(result.map(p => apiPlanner.toJSON(p, stripUser)))
    .then(x => res.status(200).type('application/json').send(x))
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    })
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  })
});

/*
 * POST /planner
 * Creates a new planner belonging to the current user.
 */
router.post('/', (req, res, next) => {
  const title = (req.body.title || '').trim();
  const stripUser = req.query.stripUser === 'true';
  if (title) {
    apiPlanner
    .create(req.user, title)
    .then(p => {
      apiPlanner
      .toJSON(p, stripUser)
      .then(o => res.status(201).type('application/json').send(o))
      .catch(e => {
        res
        .status(e.status)
        .type('application/json')
        .send(error.toJSON(e.code));
      });
    })
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    });
  } else {
    res
    .status(400)
    .type('application/json')
    .send(error.toJSON(error.code.E_ARGMISSING));
  }
});

/*
 * GET /planner/:id
 * Gets information about selected planner.
 * The `id` parameter must be pointing at a planner owned by the current user.
 */
router.get('/:id(\\d+)', (req, res, next) => {
  const stripUser = req.query.stripUser === 'true';
  apiPlanner
  .get(req.user, req.params.id)
  .then(p => {
    apiPlanner
    .toJSON(p, stripUser)
    .then(o => res.status(200).type('application/json').send(o))
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    });
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
});

/*
 * PUT /planner/:id
 * Modifies information or settings of selected planner.
 */
router.put('/:id(\\d+)', (req, res, next) => {
  const stripUser = req.query.stripUser === 'true';
  const title = (req.body.title || '').trim();
  apiPlanner
  .update(req.user, req.params.id, title)
  .then(p => {
    apiPlanner
    .toJSON(p, stripUser)
    .then(o => res.status(205).type('application/json').send(o))
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    });
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
});

/*
 * DELETE /planner/:id
 * Permanently deletes selected planner and its contents.
 */
router.delete('/:id(\\d+)', (req, res, next) => {
  const title = req.body.title || '';
  apiPlanner
  .delete(req.user, req.params.id, title)
  .then(() => {
    res.status(205).type('application/json').send({
      message: 'planner deleted'
    });
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
});

/**********************/
/* SCHEDULE RESOURCES */
/**********************/

const sBase = '/:id(\\d+)/schedule';

const processScheduleListRequest = (req, res, next, ...args) => {
  const stripPlanner = req.query.stripPlanner === 'true';
  const stripUser = req.query.stripUser === 'true';
  apiSchedule
  .getList(req.user, req.params.id, args)
  .then(list => {
    Promise
    .all(list.map(x => apiSchedule.toJSON(x, {
      stripPlanner: stripPlanner, stripUser: stripUser
    })))
    .then(o => res.status(200).type('application/json').send(o))
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    });
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
};

router.get(sBase + '/:year(\\d+)/:month(\\d+)/:day(\\d+)', (req, res, next) => {
  const year = parseInt(req.params.year);
  const month = parseInt(req.params.month);
  const day = parseInt(req.params.day);
  processScheduleListRequest(req, res, next, year, month, day);
});

router.get(sBase + '/:year(\\d+)/:month(\\d+)', (req, res, next) => {
  const year = parseInt(req.params.year);
  const month = parseInt(req.params.month);
  processScheduleListRequest(req, res, next, year, month);
});

router.get(sBase + '/:year(\\d+)', (req, res, next) => {
  const year = parseInt(req.params.year);
  processScheduleListRequest(req, res, next, year);
});

router.get(sBase, (req, res, next) => {
  processScheduleListRequest(req, res, next);
});

router.post(sBase, (req, res, next) => {
  const args = apiSchedule.processArgs(req.body);
  const stripPlanner = req.query.stripPlanner === 'true';
  const stripUser = req.query.stripUser === 'true';
  const valid =
    args.title
    && args.startsAt
    && (args.allday || (!args.allday && args.endsAt));
  if (valid) {
    apiSchedule
    .create(req.user, req.params.id, args)
    .then(s => {
      apiSchedule
      .toJSON(s, { stripPlanner: stripPlanner, stripUser: stripUser })
      .then(o => res.status(201).type('application/json').send(o))
      .catch(e => {
        res
        .status(e.status)
        .type('application/json')
        .send(error.toJSON(e.code));
      });
    })
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    });
  } else {
    res
    .status(401)
    .type('application/json')
    .send(error.toJSON(error.code.E_BADARG))
  }
});

/************************/
/* TO-DO LIST RESOURCES */
/************************/

/*
 * GET /planner/:id/todo-list
 * Gets a list of all to-do lists saved in the selected planner.
 */
router.get('/:id(\\d+)/todo-list', (req, res, next) => {
  const stripPlanner = req.query.stripPlanner === 'true';
  const stripUser = req.query.stripUser === 'true';
  apiTodoList
  .getAll(req.user, req.params.id)
  .then(lists => {
    const promises = lists.map(l => apiTodoList.toJSON(l, {
      stripPlanner: stripPlanner,
      stripUser: stripUser
    }));
    Promise
    .all(promises)
    .then(o => res.status(200).type('application/json').send(o))
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    });
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
});

/*
 * POST /planner/:id/todo-list
 * Adds a new to-do list to the selected planner.
 */
router.post('/:id(\\d+)/todo-list', (req, res, next) => {
  const title = (req.body.title || '').trim();
  const stripPlanner = req.query.stripPlanner === 'true';
  const stripUser = req.query.stripUser === 'true';
  if (title) {
    apiTodoList
    .create(req.user, req.params.id, title)
    .then(l => {
      apiTodoList
      .toJSON(l, { stripPlanner: stripPlanner, stripUser: stripUser })
      .then(o => res.status(201).type('application/json').send(o))
      .catch(e => {
        res
        .status(e.status)
        .type('application/json')
        .send(error.toJSON(e.code));
      });
    })
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    });
  } else {
    res
    .status(400)
    .type('application/json')
    .send(error.toJSON(error.code.E_ARGMISSING));
  }
});

module.exports = router;
