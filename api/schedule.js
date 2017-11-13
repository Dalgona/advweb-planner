const error = require('./error');
const Schedule = require('../models').Schedule;
const apiPlanner = require('./planner');
const apiLabel = require('./label');

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
  const allday = reqBody.allday === 'true';
  const labels =
    (reqBody.labels || '')
    .split(',')
    .map(x => x.trim())
    .filter(x => x !== '');
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
  Promise
  .all(ids.map(id => apiLabel.get(token, id)))
  .then(resolve)
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
      allday: args.allday
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
  toJSON: toJSON
};
