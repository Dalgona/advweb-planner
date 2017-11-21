(function (win) {
  /**
   * Constructor function of AjaxWrapper objects.
   *
   * AjaxWrapper wraps all required AJAX requests into methods.
   * @param {string} apiRoot The root URL of all API resources
   */
  function AjaxWrapper(apiRoot) {
    const API_ROOT = apiRoot;

    /**
     * Send an AJAX request to the API server.
     * @param {string} method The name of an HTTP method
     * @param {string} url Request URL which will be appended to `apiRoot`
     * @param {object} data Additional data to send
     * @param {(status: Number, data: string) => void} onComplete
     * @param {(status: Number, data: any) => any} onError
     */
    this._ajax = function (method, url, data, onComplete, onError) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function (e) {
        if (this.status >= 200 && this.status < 300) {
          if (onComplete) {
            onComplete(this.status, JSON.parse(this.responseText));
          }
        } else {
          if (onError) {
            onError(this.status, JSON.parse(this.responseText));
          }
        }
      };
      xhr.onerror = function (e) {
        onError(undefined, e);
      };
      xhr.open(method, API_ROOT + url, true);
      if (localStorage.plannerUserToken) {
        xhr.setRequestHeader(
          'Authorization',
          'Bearer ' + localStorage.plannerUserToken
        );
      }
      if (data) {
        xhr.setRequestHeader(
          'Content-Type',
          'application/x-www-form-urlencoded'
        );
        var params = [];
        for (var key in data) {
          var name = encodeURIComponent(key);
          var value = encodeURIComponent(data[key]);
          params.push(name + '=' + value);
        }
        xhr.send(params.join('&'));
      } else {
        xhr.send();
      }
    };
  }

  AjaxWrapper.prototype = {
    // POST /user

    // GET /user
    /**
     * Retrieve user information from the server.
     * @param {(status: number, user: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    getUserInfo: function (onComplete, onError) {
      this._ajax('get', '/user', null, onComplete, onError);
    },

    // PUT /user

    // DELETE /user
    /**
     * Delete the current user account.
     * @param {{email: string, auth: string}} args
     * @param {(status: number, response: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    deleteUser: function (args, onComplete, onError) {
      if (!args
          || !args.email || !args.email.trim()
          || !args.auth || !args.auth.trim()) {
        onError(undefined, {
          error: {
            message: 'you must provide both the email address and the password'
          }
        });
      }
    },

    // POST /usr/authenticate
    /**
     * Sign in to the service with the given credential.
     * @param {string} email E-mail address of the user
     * @param {string} auth Password of the user
     * @param {(status: number, user: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    signIn: function (email, auth, onComplete, onError) {
      var that = this;
      var doSignIn = function () {
        that._ajax('post', '/user/authenticate', {
            email: email,
            auth: auth
          }, function (status, response) {
            localStorage.plannerUserToken = response.token;
            that.getUserInfo(onComplete, onError);
          }, onError
        );
      };

      if (localStorage.plannerUserToken) {
        this.getUserInfo(function (status, user) {
          onError(undefined, {
            error: { message: 'already signed in as ' + user.email }
          });
        }, function(status, reason) {
          doSignIn();
        });
      } else {
        doSignIn();
      }
    },

    // GET /planner
    /**
     * Retrieve all planners owned by the current user.
     * @param {(status: number, planners: object[]) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    getAllPlanners: function (onComplete, onError) {
      this._ajax('get', '/planner', null, onComplete, onError);
    },

    // POST /planner

    // GET /planner/:id
    /**
     * Retrieve information of selected planner.
     * @param {number} plannerId
     * @param {(status: number, planner: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    getPlanner: function (plannerId, onComplete, onError) {
      this._ajax('get', '/planner/' + plannerId, null, onComplete, onError);
    },

    // PUT /planner/:id

    // DELETE /planner/:id
    /**
     * Deletes the specified planner.
     * @param {number} plannerId
     * @param {{title: string}} args
     * @param {(status: number, response: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    deletePlanner: function (plannerId, args, onComplete, onError) {
      if (!args || !args.title || !args.title.trim()) {
        onError(undefined, {
          error: { message: 'title cannot be empty' }
        });
        return;
      }
      this._ajax('delete', '/planner/' + plannerId, args, onComplete, onError);
    },

    // GET /planner/:id/schedule
    // GET /planner/:id/schedule/:year
    // GET /planner/:id/schedule/:year/:month
    // GET /planner/:id/schedule/:year/:month/:day
    /**
     * Retrieve schedules associated with the selected planner.
     * @param {number} plannerId
     * @param {number[]} range Filter the returned list by starting date.
     * @param {(status: number, schedules: object[]) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    getSchedules: function (plannerId, range, onComplete, onError) {
      var path = range.join('/');
      this._ajax(
        'get', '/planner/' + plannerId + '/schedule/' + path, null,
        onComplete, onError
      );
    },

    // POST /planner/:id/schedule

    // GET /schedule/:id
    /**
     * Retrieve information of the selected schedule.
     * @param {number} scheduleId
     * @param {(status: number, schedule: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    getSchedule: function (scheduleId, onComplete, onError) {
      this._ajax('get', '/schedule/' + scheduleId, null, onComplete, onError);
    },

    // PUT /schedule/:id

    // DELETE /schedule/:id
    /**
     * Delete the specified schedule.
     * @param {number} id
     * @param {(status: number, response: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    deleteSchedule: function (id, onComplete, onError) {
      this._ajax('delete', '/schedule/' + id, null, onComplete, onError);
    },

    // GET /planner/:id/todo-list
    /**
     * Retrieve a list of all to-do lists associated with the selected planner.
     * @param {number} plannerId
     * @param {(status: number, todoLists: object[]) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    getAllTodoLists: function (plannerId, onComplete, onError) {
      this._ajax(
        'get', '/planner/' + plannerId + '/todo-list', null,
        onComplete, onError
      );
    },

    // POST /planner/:id/todo-list

    // GET /todo-list/:id
    /**
     * Retrieve information of the selected to-do list.
     * @param {number} listId
     * @param {(status: number, list: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    getTodoList: function (listId, onComplete, onError) {
      this._ajax('get', '/todo-list/' + listId, null, onComplete, onError);
    },

    // PUT /todo-list/:id

    // DELETE /todo-list/:id
    /**
     * Delete the specified to-do list.
     * @param {number} id
     * @param {(status: number, response: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    deletetodoList: function (listId, onComplete, onError) {
      this._ajax('delete', '/todo-list/' + listId, null, onComplete, onError);
    },

    // POST /todo-list/:id/item

    // GET /todo-item/:id
    /**
     * Retrieve information of the selected to-do list item.
     * @param {number} itemId
     * @param {(status: number, item: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    getTodoListItem: function (itemId, onComplete, onError) {
      this._ajax('get', '/todo-item/' + itemId, null, onComplete, onError);
    },

    // PUT /todo-item/:id

    // DELETE /todo-item/:id
    /**
     * Delete the specified to-do list item.
     * @param {number} itemId
     * @param {(status: number, response: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    deleteTodoListItem: function (itemId, onComplete, onError) {
      this._ajax('delete', '/todo-item/' + itemId, null, onComplete, onError);
    },

    // GET /label
    /**
     * Retrieve a list of all labels owned by the currente user.
     * @param {(status: number, labels: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    getAllLabels: function (onComplete, onError) {
      this._ajax('get', '/label', null, onComplete, onError);
    },

    // POST /label

    // GET /label/:id
    /**
     * Retrieve information of the selected label.
     * @param {number} labelId
     * @param {(status: number, label: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    getLabel: function (labelId, onComplete, onError) {
      this._ajax('get', '/label/' + labelId, null, onComplete, onError);
    },

    // PUT /label/:id

    // DELETE /label/:id
    /**
     * Delete the specified label.
     * @param {number} labelId
     * @param {(status: number, response: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    deleteLabel: function (labelId, onComplete, onError) {
      this._ajax('delete', '/label/' + labelId, null, onComplete, onError);
    }
  };

  win.plannerClientLib = {
    AjaxWrapper: AjaxWrapper, // TODO: hide when completed
  };
})(window);
