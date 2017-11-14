const error = require('./error');
const Schedule = require('../models').Schedule;
const apiPlanner = require('./planner');
const apiLabel = require('./label');
const Op = require('sequelize').Op;

/*
 * Processes parameters for POST and PUT requests.
 */
const processArgs = reqBody => {
  const _trimmed = str => (str || '').trim();
  const title = _trimmed(reqBody.title);
  const location = _trimmed(reqBody.location);
  const description = _trimmed(reqBody.description);
  const startsAt = reqBody.startsAt ? new Date(reqBody.startsAt) : null;
  const endsAt = reqBody.endsAt ? new Date(reqBody.endsAt) : null;
  const allday = reqBody.allday ? (reqBody.allday === 'true') : null;
  const labels =
    reqBody.labels
      ? [...new Set(
          reqBody
          .labels
          .split(',')
          .map(x => x.trim())
          .filter(x => x !== '')
        )]
      : null;
  return {
    title: title,
    location: location,
    description: description,
    startsAt: startsAt ? (!isNaN(startsAt.getTime()) ? startsAt : null) : null,
    endsAt: endsAt ? (!isNaN(endsAt.getTime()) ? endsAt : null) : null,
    allday: allday,
    labels: labels
  };
};

/*
 * Converts an array of label IDs into an array of label instances.
 */
const fromLabelIds = (token, ids) => new Promise((resolve, reject) => {
  if (ids == null) {
    resolve([]);
    return;
  }
  Promise
  .all(ids.map(id => apiLabel.get(token, id)))
  .then(resolve)
  .catch(reject);
});

/*
 * Gets an appropriately filtered list of schedules.
 * arg[0]: year
 * arg[1]: month
 * arg[2]: date
 */
const getList = (token, plannerId, arg) => new Promise((resolve, reject) => {
  let where;
  switch (arg.length) {
  case 1:
    where = {
      startsAt: {
        [Op.and]: {
          [Op.gte]: new Date(arg[0], 0, 1, 0, 0, 0, 0),
          [Op.lt]: new Date(arg[0] + 1, 0, 1, 0, 0, 0, 0)
        }
      }
    };
    break;
  case 2:
    where = {
      startsAt: {
        [Op.and]: {
          [Op.gte]: new Date(arg[0], arg[1] - 1, 1, 0, 0, 0, 0),
          [Op.lt]: new Date(arg[0], arg[1], 1, 0, 0, 0, 0)
        }
      }
    };
    break;
  case 3:
    where = {
      startsAt: {
        [Op.and]: {
          [Op.gte]: new Date(arg[0], arg[1] - 1, arg[2], 0, 0, 0, 0),
          [Op.lt]: new Date(arg[0], arg[1] - 1, arg[2] + 1, 0, 0, 0, 0)
        }
      }
    };
    break;
  default:
    where = {};
    break;
  }
  apiPlanner
  .get(token, plannerId)
  .then(p => {
    p
    .getSchedules({
      where: where,
      order: [ [ 'startsAt', 'ASC' ] ]
    })
    .then(resolve)
    .catch(e => {
      console.log(e);
      reject({ status: 500, code: error.code.E_DBERROR });
    });
  })
  .catch(reject);
});

/*
 * Gets information of specified planner.
 */
const get = (token, scheduleId) => new Promise((resolve, reject) => {
  Schedule
  .findOne({ where: { id: scheduleId } })
  .then(schedule => {
    if (schedule) {
      schedule
      .getPlanner()
      .then(p => {
        if (p.UserId == token.userId) {
          resolve(schedule);
        } else {
          reject({ status: 403, code: error.code.E_NOACCESS });
        }
      })
      .catch(e => {
        console.error(e);
        reject({ status: 500, code: error.code.E_DBERROR });
      });
    } else {
      reject({ status: 404, code: error.code.E_NOENT });
    }
  })
  .catch(e => {
    console.error(e);
    reject({ status: 500, code: error.code.E_DBERROR });
  });
});

//const update = (token, scheduleId, args) => 

/*
 * Permanently deletes specified schedule.
 */
const delete_ = (token, scheduleId) => new Promise((resolve, reject) => {
  get(token, scheduleId)
  .then(schedule => {
    schedule.destroy().then(resolve).catch(e => {
      console.error(e);
      reject({ status: 500, code: error.code.E_DBERROR });
    });
  })
  .catch(reject);
});

/*
 * Adds a new schedule in specified planner.
 */
const create = (token, plannerId, args) => new Promise((resolve, reject) => {
  apiPlanner
  .get(token, plannerId)
  .then(p => {
    const now = new Date();
    p
    .createSchedule({
      createdAt: now,
      modifiedAt: now,
      title: args.title,
      description: args.description,
      location: args.location,
      startsAt: args.startsAt,
      endsAt: args.endsAt || new Date(0),
      allday: args.allday || false
    })
    .then(s => {
      fromLabelIds(token, args.labels)
      .then(labels => {
        s
        .addLabels(labels)
        .then(() => resolve(s))
        .catch(e => {
          console.error(e);
          reject({ status: 500, code: error.code.E_DBERROR });
        });
      })
      .catch(reject);
    })
    .catch(e => {
      console.error(e);
      reject({ status: 500, code: error.code.E_DBERROR });
    });
  })
  .catch(reject);
});

const toJSON = (instance, options) => new Promise((resolve, reject) => {
  const ret = {
    id: instance.id,
    createdAt: instance.createdAt,
    modifiedAt: instance.modifiedAt,
    planner: null,
    title: instance.title,
    description: instance.description,
    location: instance.location,
    startsAt: instance.startsAt,
    endsAt: instance.endsAt,
    allday: instance.allday,
    labels: null
  };
  instance
  .getLabels()
  .then(labels => {
    ret.labels = labels.map(apiLabel.toJSON);
    if (options.stripPlanner) {
      resolve(ret);
    } else {
      instance
      .getPlanner()
      .then(p => {
        apiPlanner
        .toJSON(p, options.stripUser)
        .then(o => {
          ret.planner = o;
          resolve(ret);
        })
        .catch(reject);
      })
      .catch(e => {
        console.error(e);
        reject({ status: 500, code: error.code.E_DBERROR });
      });
    }
  })
  .catch(e => {
    console.error(e);
    reject({ status: 500, code: error.code.E_DBERROR });
  });
});

module.exports = {
  processArgs: processArgs,
  create: create,
  getList: getList,
  get: get,
  //update: update,
  delete: delete_,
  toJSON: toJSON
};
