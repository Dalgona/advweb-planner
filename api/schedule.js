const _ = require('lodash');
const error = require('./error');
const Schedule = require('../models').Schedule;
const apiPlanner = require('./planner');
const apiLabel = require('./label');
const Op = require('sequelize').Op;
const { failWithDBError } = require('./utils');

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
function fromLabelIds(token, ids) {
  return new Promise((resolve, reject) => {
    if (ids == null) {
      resolve([]);
      return;
    }
    Promise
    .all(ids.map(id => apiLabel.get(token, id)))
    .then(resolve)
    .catch(reject);
  });
}

/*
 * Gets an appropriately filtered list of schedules.
 * arg: [year?, month?, date?]
 */
const getList = (token, plannerId, arg) => new Promise((resolve, reject) => {
  let where = {};
  let dateGte;
  let dateLt;
  switch (arg.length) {
  case 1:
    dateGte = new Date(arg[0], 0, 1, 0, 0, 0, 0);
    dateLt = new Date(arg[0] + 1, 0, 1, 0, 0, 0, 0);
    break;
  case 2:
    dateGte = new Date(arg[0], arg[1] - 1, 1, 0, 0, 0, 0);
    dateLt = new Date(arg[0], arg[1], 1, 0, 0, 0, 0);
    break;
  case 3:
    dateGte = new Date(arg[0], arg[1] - 1, arg[2], 0, 0, 0, 0);
    dateLt = new Date(arg[0], arg[1] - 1, arg[2] + 1, 0, 0, 0, 0);
    break;
  }
  if (arg.length > 0) {
    where = { startsAt: { [Op.and]: { [Op.gte]: dateGte, [Op.lt]: dateLt } } };
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
    .catch(failWithDBError(reject));
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
      .catch(failWithDBError(reject));
    } else {
      reject({ status: 404, code: error.code.E_NOENT });
    }
  })
  .catch(failWithDBError(reject));
});

/*
 * Updates information of specified schedule.
 */
const update = (token, scheduleId, args) => new Promise((resolve, reject) => {
  get(token, scheduleId)
  .then(s => {
    s
    .getLabels()
    .then(labels => {
      let change = false;
      let newLabelIds = null;
      const keys = [
        'title', 'location', 'description', 'allday', 'startsAt', 'endsAt'
      ];
      for (let key of keys) {
        if (args[key] != null && !_.isEqual(s[key], args[key])) {
          s[key] = args[key];
          change = true;
        }
      }
      if (args.labels) {
        const origLabelSet = new Set(labels.map(l => '' + l.id));
        const newLabelSet = new Set(args.labels);
        if (!_.isEqual(origLabelSet, newLabelSet)) {
          change = true;
          newLabelIds = args.labels;
        }
      }
      if (change) {
        if (!s.allday && s.startsAt > s.endsAt) {
          reject({ status: 400, code: error.code.E_BADDATERANGE });
          return;
        }
        s.modifiedAt = new Date();
        doUpdate(token, s, newLabelIds).then(resolve).catch(reject);
      } else {
        resolve(s);
      }
    })
    .catch(failWithDBError(reject));
  })
  .catch(reject);
});

/*
 * Actually update the information to the DB.
 */
function doUpdate(token, schedule, newLabelIds) {
  return new Promise((resolve, reject) => {
    schedule
    .save()
    .then(newSchedule => {
      if (!newLabelIds) {
        resolve(newSchedule);
      } else {
        fromLabelIds(token, newLabelIds)
        .then(newLabels => {
          newSchedule
          .setLabels(newLabels)
          .then(() => resolve(newSchedule))
          .catch(failWithDBError(reject));
        })
        .catch(reject);
      }
    })
    .catch(failWithDBError(reject));
  });
}

/*
 * Permanently deletes specified schedule.
 */
const delete_ = (token, scheduleId) => new Promise((resolve, reject) => {
  get(token, scheduleId)
  .then(schedule => {
    schedule.destroy().then(resolve).catch(failWithDBError(reject));
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
    if (!args.allday && args.startsAt > args.endsAt) {
      reject({ status: 400, code: error.code.E_BADDATERANGE });
      return;
    }
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
        .catch(failWithDBError(reject));
      })
      .catch(reject);
    })
    .catch(failWithDBError(reject));
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
      .catch(failWithDBError(reject));
    }
  })
  .catch(failWithDBError(reject));
});

module.exports = {
  processArgs: processArgs,
  create: create,
  getList: getList,
  get: get,
  update: update,
  delete: delete_,
  toJSON: toJSON
};
