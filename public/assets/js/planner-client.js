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
          onComplete(this.status, JSON.parse(this.responseText));
        } else {
          onError(this.status, JSON.parse(this.responseText));
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
     * @param {(user: object) => void} onComplete
     * @param {(reason: object) => void} onError
     */
    getUserInfo: function (onComplete, onError) {
      this._ajax('get', '/user', null,
        function (status, response) {
          onComplete(response);
        }, function (status, reason) {
          onError(reason);
        }
      );
    },

    // PUT /user

    // DELETE /user

    // POST /usr/authenticate
    /**
     * Sign in to the service with the given credential.
     * @param {string} email E-mail address of the user
     * @param {string} auth Password of the user
     * @param {(user: object) => void} onComplete
     * @param {(reason: object) => void} onError
     */
    signIn: function (email, auth, onComplete, onError) {
      var that = this;
      var doSignIn = function () {
        that._ajax('post', '/user/authenticate', {
            email: email,
            auth: auth
          }, function (status, response) {
            localStorage.plannerUserToken = response.token;
            that.getUserInfo(
              function (user) { onComplete(user); },
              function (reason) { onError(reason); }
            );
          }, function (status, reason) {
            onError(reason);
          }
        );
      };

      if (localStorage.plannerUserToken) {
        this.getUserInfo(function (user) {
          onError({
            error: { message: 'already signed in as ' + user.email }
          });
        }, function(_) {
          doSignIn();
        })
      } else {
        doSignIn();
      }
    },

    // GET /planner
    /**
     * Retrieve all planners owned by the current user.
     * @param {(planners: object[]) => void} onComplete
     * @param {(reason: object) => void} onError
     */
    getAllPlanners: function (onComplete, onError) {
      this._ajax('get', '/planner', null,
        function (status, response) {
          onComplete(response);
        }, function (status, reason) {
          onError(reason);
        }
      );
    },

    // POST /planner

    // GET /planner/:id
    /**
     * Retrieve information of selected planner.
     * @param {number} plannerId
     * @param {(planner: object) => void} onComplete
     * @param {(reason: object) => void} onError
     */
    getPlanner: function (plannerId, onComplete, onError) {
      this._ajax('get', '/planner/' + plannerId, null,
        function (status, response) {
          onComplete(response);
        }, function (status, reason) {
          onError(reason);
        }
      );
    },

    // PUT /planner/:id

    // DELETE /planner/:id

    // GET /planner/:id/schedule
    // GET /planner/:id/schedule/:year
    // GET /planner/:id/schedule/:year/:month
    // GET /planner/:id/schedule/:year/:month/:day
    /**
     * Retrieve schedules associated with the selected planner.
     * @param {number} plannerId
     * @param {number[]} range Filter the returned list by starting date.
     * @param {(schedules: object[]) => void} onComplete
     * @param {(reason: object) => void} onError
     */
    getSchedules: function (plannerId, range, onComplete, onError) {
      var path = range.join('/');
      this._ajax('get', '/planner/' + plannerId + '/schedule/' + path, null,
        function (status, response) {
          onComplete(response);
        }, function (status, reason) {
          onError(reason);
        }
      );
    },

    // POST /planner/:id/schedule

    // GET /schedule/:id
    /**
     * Retrieve information of the selected schedule.
     * @param {number} scheduleId
     * @param {(schedule: object) => void} onComplete
     * @param {(reason: object) => void} onError
     */
    getSchedule: function (scheduleId, onComplete, onError) {
      this._ajax('get', '/schedule/' + scheduleId, null,
        function (status, response) {
          onComplete(response);
        }, function (status, reason) {
          onError(reason);
        }
      );
    },

    // PUT /schedule/:id

    // DELETE /schedule/:id

    // GET /planner/:id/todo-list
    /**
     * Retrieve a list of all to-do lists associated with the selected planner.
     * @param {number} plannerId
     * @param {(todoLists: object[]) => void} onComplete
     * @param {(reason: object) => void} onError
     */
    getAllTodoLists: function (plannerId, onComplete, onError) {
      this._ajax('get', '/planner/' + plannerId + '/todo-list', null,
        function (status, response) {
          onComplete(response);
        }, function (status, reason) {
          onError(reason);
        }
      );
    },

    // POST /planner/:id/todo-list

    // GET /todo-list/:id
    /**
     * Retrieve information of the selected to-do list.
     * @param {number} listId
     * @param {(list: object) => void} onComplete
     * @param {(reason: object) => void} onError
     */
    getTodoList: function (listId, onComplete, onError) {
      this._ajax('get', '/todo-list/' + listId, null,
        function (status, response) {
          onComplete(response);
        }, function (status, reason) {
          onError(reason);
        }
      );
    },

    // PUT /todo-list/:id

    // DELETE /todo-list/:id

    // POST /todo-list/:id/item

    // GET /todo-item/:id
    /**
     * Retrieve information of the selected to-do list item.
     * @param {number} itemId
     * @param {(item: object) => void} onComplete
     * @param {(reason: object) => void} onError
     */
    getTodoListItem: function (itemId, onComplete, onError) {
      this._ajax('get', '/todo-item/' + itemId, null,
        function (status, response) {
          onComplete(response);
        }, function (status, reason) {
          onError(reason);
        }
      );
    },

    // PUT /todo-item/:id

    // DELETE /todo-item/:id

    // GET /label
    /**
     * Retrieve a list of all labels owned by the currente user.
     * @param {(labels: object) => void} onComplete
     * @param {(reason: object) => void} onError
     */
    getAllLabels: function (onComplete, onError) {
      this._ajax('get', '/label', null,
        function (status, response) {
          onComplete(response);
        }, function (status, reason) {
          onError(reason);
        }
      );
    },

    // POST /label

    // GET /label/:id
    /**
     * Retrieve information of the selected label.
     * @param {number} labelId
     * @param {(label: object) => void} onComplete
     * @param {(reason: object) => void} onError
     */
    getLabel: function (labelId, onComplete, onError) {
      this._ajax('get', '/label/' + labelId, null,
        function (status, response) {
          onComplete(response);
        }, function (status, reason) {
          onError(reason);
        }
      );
    },

    // PUT /label/:id

    // DELETE /label/:id
  };

  win.plannerClientLib = {
    AjaxWrapper: AjaxWrapper, // TODO: hide when completed
  };
})(window);
