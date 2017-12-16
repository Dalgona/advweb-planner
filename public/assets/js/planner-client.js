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
    /**
     * Create a new user account.
     * @param {{fullName: string, email: string, auth: string}} args
     * @param {(status: number, user: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    createUser: function (args, onComplete, onError) {
      this._ajax('post', '/user', args, onComplete, onError);
    },

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
    /**
     * Update information of the current user.
     * @param {{fullName: string, oldAuth: string, newAuth: string}} args
     * @param {(status: number, user: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    updateUserInfo: function (args, onComplete, onError) {
      this._ajax('put', '/user', args, onComplete, onError);
    },

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
    /**
     * Create a new planner.
     * @param {{title: string}} args
     * @param {(status: number, planner: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    createPlanner: function (args, onComplete, onError) {
      this._ajax('post', '/planner', args, onComplete, onError);
    },

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
    /**
     * Update information of selected planner.
     * @param {number} plannerId
     * @param {{title: string}} args
     * @param {(status: number, planner: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    updatePlanner: function (plannerId, args, onComplete, onError) {
      this._ajax('put', '/planner/' + plannerId, args, onComplete, onError);
    },

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
    /**
     * Add a new schedule to the selected planner.
     * @param {number} plannerId
     * @param {object} args
     * @param {(status: number, schedule: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    createSchedule: function (plannerId, args, onComplete, onError) {
      this._ajax('post', '/planner/' + plannerId + '/schedule', args,
        onComplete, onError);
    },

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
    /**
     * Edit information of the selected schedule.
     * @param {number} id
     * @param {object} args
     * @param {(status: number, schedule: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    updateSchedule: function (scheduleId, args, onComplete, onError) {
      this._ajax('put', '/schedule/' + scheduleId, args, onComplete, onError);
    },

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
    /**
     * Add a new to-do list to the selected planner.
     * @param {number} plannerId
     * @param {{title: string}} args
     * @param {(status: number, list: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    createTodoList: function (plannerId, args, onComplete, onError) {
      this._ajax('post', '/planner/' + plannerId + '/todo-list', args,
        onComplete, onError);
    },

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
    /**
     * Update information of the selected to-do list.
     * @param {number} listId
     * @param {{title: string}} args
     * @param {(status: number, list: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    updateTodoList: function (listId, args, onComplete, onError) {
      this._ajax('put', '/todo-list/' + listId, args, onComplete, onError);
    },

    // DELETE /todo-list/:id
    /**
     * Delete the specified to-do list.
     * @param {number} id
     * @param {(status: number, response: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    deleteTodoList: function (listId, onComplete, onError) {
      this._ajax('delete', '/todo-list/' + listId, null, onComplete, onError);
    },

    // POST /todo-list/:id/item
    /**
     * Append a new list item to the selected to-do list.
     * @param {number} listId
     * @param {{title: string}} args
     * @param {(status: number, item: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    createTodoItem: function (listId, args, onComplete, onError) {
      this._ajax('post', '/todo-list/' + listId + '/item', args,
        onComplete, onError);
    },

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
    /**
     * Modify information of the selected to-do list item.
     * @param {number} itemId
     * @param {{title: string}} args
     * @param {(status: number, item: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    updateTodoItem: function (itemId, args, onComplete, onError) {
      this._ajax('put', '/todo-item/' + itemId, args, onComplete, onError);
    },

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
    /**
     * Create a new label.
     * @param {{title: string, color: string}} args
     * @param {(status: number, newLabel: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    createLabel: function (args, onComplete, onError) {
      if (!args || !args.title || !args.title.trim()) {
        onError(undefined, {
          error: { message: 'title cannot be left empty' }
        });
        return;
      }
      this._ajax('post', '/label', args, onComplete, onError);
    },

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
    /**
     * Modify information of the selected label.
     * @param {number} labelId
     * @param {{title: string, color: string}} args
     * @param {(status: number, newLabel: object) => void} onComplete
     * @param {(status: number, reason: object) => void} onError
     */
    updateLabel: function (labelId, args, onComplete, onError) {
      this._ajax('put', '/label/' + id, args, onComplete, onError);
    },

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
    AjaxWrapper: AjaxWrapper
  };
})(window);
