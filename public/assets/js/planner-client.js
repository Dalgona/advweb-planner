(function (win) {
  /**
   * Constructor function of PlannerClient objects.
   * @param {string} apiRoot The root URL of all API resources
   */
  function PlannerClient(apiRoot) {
    const API_ROOT = apiRoot;

    this.currentUser = null;

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

  PlannerClient.prototype = {
    // POST /user

    // GET /user
    /**
     * Retrieve user information from the server.
     * @param {(user: object) => void} onComplete
     * @param {(reason: object) => void} onError
     */
    getUserInfo: function (onComplete, onError) {
      var that = this;
      this._ajax('get', '/user', null,
        function (status, response) {
          that.currentUser = response;
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

    // POST /planner

    // GET /planner/:id

    // PUT /planner/:id

    // DELETE /planner/:id

    // GET /planner/:id/schedule

    // GET /planner/:id/schedule/:year

    // GET /planner/:id/schedule/:year/:month

    // GET /planner/:id/schedule/:year/:month/:day

    // POST /planner/:id/schedule

    // GET /schedule/:id

    // PUT /schedule/:id

    // DELETE /schedule/:id

    // GET /planner/:id/todo-list

    // POST /planner/:id/todo-list

    // GET /todo-list/:id

    // PUT /todo-list/:id

    // DELETE /todo-list/:id

    // POST /todo-list/:id/item

    // GET /todo-item/:id

    // PUT /todo-item/:id

    // DELETE /todo-item/:id

    // GET /label

    // POST /label

    // GET /label/:id

    // PUT /label/:id

    // DELETE /label/:id
  };

  win.plannerClientLib = {
    PlannerClient: PlannerClient,
  };
})(window);
