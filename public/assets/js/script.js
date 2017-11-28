(function (win) {
  function SignInForm(baseElement) {
    this.element = baseElement;
    this.mode = 0; // 0: sign-in, 1: create account
    this.submitClicked = null;

    var that = this;
    var tabs =
      this.element
      .getElementsByClassName('top-tabs')[0]
      .getElementsByClassName('tab');
    for (var i = 0; i < tabs.length; i++) {
      (function (index) {
        tabs[index].addEventListener('click', function (e) {
          that.mode = index;
          that.updateUI();
        }, false);
      })(i);
    }

    var formItems = this.element.getElementsByClassName('form-item');
    for (var i = 0; i < formItems.length; i++) {
      formItems[i].style.height = '2.25rem';
      formItems[i].setAttribute('data-index', i);
    }

    var inputFields = [
      document.getElementById('signin-email'),
      document.getElementById('signin-fullname'),
      document.getElementById('signin-password'),
      document.getElementById('signin-confirm')
    ];
    var signInButton = document.getElementById('signin-button');
    for (var i = 0; i < inputFields.length; i++) {
      inputFields[i].addEventListener('keyup', (function (e) {
        this.validate();
      }).bind(this), false);
    }
    signInButton.addEventListener('click', (function (e) {
      e.preventDefault();
      if (!this.submitClicked) {
        console.warn('[SignInForm] Please assign appropriate event handler to `submitClicked`.');
      } else {
        var args = [];
        for (var i = 0; i < 4; i++) {
          args.push(inputFields[i].value);
        }
        this.submitClicked.apply(this, args);
      }
    }).bind(this), false);

    var errorMsg = this.element.getElementsByClassName('error-message')[0];
    hide(errorMsg);

    /**
     * Reset the state of the sign-in form.
     */
    this.reset = function () {
      this.mode = 0;
      this.setError(null);
      for (var i = 0; i < 4; i++) {
        formItems[i].getElementsByTagName('input')[0].value = '';
      }
    };

    /**
     * Checks if all input fields are filled by the user.
     */
    this.allFilled = function () {
      var acc = true;
      acc = acc && !!inputFields[0].value;
      acc = acc && !!inputFields[2].value;
      if (this.mode == 1) {
        acc = acc && !!inputFields[1].value;
        acc = acc && !!inputFields[3].value;
      }
      return acc;
    }

    /**
     * Checks if the values of two password fields match.
     */
    this.passwordMatches = function () {
      if (this.mode == 0) {
        return true;
      }
      return inputFields[2].value === inputFields[3].value;
    }

    this.validate = function (setTo) {
      if (setTo !== undefined) {
        signInButton.disabled = !setTo;
        return setTo;
      }
      if (!this.allFilled()) {
        signInButton.disabled = true;
        return true;
      }
      if (!this.passwordMatches()) {
        signInButton.disabled = true;
        inputFields[3].classList.add('error');
        return false;
      }
      signInButton.disabled = false;
      inputFields[3].classList.remove('error');
      return true;
    };

    this.setError = function (message) {
      if (!message) {
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
      } else {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
      }
    }

    this.updateUI = function () {
      var elemForSignIn = this.element.getElementsByClassName('for-signin');
      var elemForSignUp = this.element.getElementsByClassName('for-signup');
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
      }
      tabs[this.mode].classList.add('active');
      switch (this.mode) {
        case 0:
          for (var i = 0; i < elemForSignIn.length; i++) {
            show(elemForSignIn[i]);
          }
          for (var i = 0; i < elemForSignUp.length; i++) {
            hide(elemForSignUp[i]);
          }
          signInButton.value = 'Sign in';
          break;
        case 1:
          for (var i = 0; i < elemForSignIn.length; i++) {
            hide(elemForSignIn[i]);
          }
          for (var i = 0; i < elemForSignUp.length; i++) {
            show(elemForSignUp[i]);
          }
          signInButton.value = 'Create Account';
          break;
      }
      this.validate();
    };

    function show(element) {
      element.style.display = '';
      element.classList.add('anim');
      setTimeout(function () {
        element.classList.remove('hidden');
      }, 5);
      setTimeout(function () {
        element.classList.remove('anim');
      }, 350);
    }

    function hide(element) {
      element.classList.add('anim');
      element.classList.add('hidden');
      setTimeout(function () {
        element.classList.remove('anim');
        element.style.display = 'none';
      }, 350);
    }
    
    this.reset();
    this.updateUI();
  }

  function PlannerList(baseElement) {
    this.element = baseElement;
    this.addNewClicked = null;
    this.itemClicked = null;
    this.planners = [];

    var that = this;
    var listElement = this.element.getElementsByClassName('list')[0];
    var addNewButton = this.element.getElementsByClassName('add-new')[0];

    addNewButton.addEventListener('click', (function (e) {
      if (!this.addNewClicked) {
        console.warn('[PlannerList] Please assign appropriate event handler to `addNewClicked`.');
      } else {
        this.addNewClicked.call(this);
      }
    }).bind(this), false);

    this.updateUI = function () {
      listElement.innerHTML = '';
      for (var i = 0; i < this.planners.length; i++) {
        listElement.appendChild(createItemElement(this.planners[i]));
      }
      listElement.appendChild(addNewButton);
    };

    function createItemElement(planner) {
      var e = document.createElement('div');
      e.className = 'item';
      e.textContent = planner.title;
      e.setAttribute('data-planner-id', planner.id);
      e.addEventListener('click', function (e) {
        if (!that.itemClicked) {
          console.warn('[PlannerList] Please assign appropriate event handler to `itemClicked`.');
        } else {
          that.itemClicked.call(that, planner);
        }
      }, false);
      return e;
    }

    this.updateUI();
  }

  function DateSpinner(baseElement) {
    this.element = baseElement;
    this.baseDate = new Date();
    this.prevClicked = null;
    this.nextClicked = null;

    var mode = 0; // 0: monthly, 1: weekly, 2: daily
    var date = new Date();
    var prevBtn = this.element.getElementsByClassName('prev')[0];
    var nextBtn = this.element.getElementsByClassName('next')[0];
    var bigText = this.element.getElementsByClassName('big')[0];
    var detailText = this.element.getElementsByClassName('detail')[0];

    prevBtn.onclick = (function (e) {
      switch (mode) {
        case 0:
          date.setMonth(date.getMonth() - 1, 1);
          break;
        case 1:
          date.setDate(date.getDate() - 7);
          break;
        case 2:
          date.setDate(date.getDate() - 1);
          break;
      }
      this.updateUI();
      if (this.prevClicked) {
        this.prevClicked(mode, date);
      }
    }).bind(this);

    nextBtn.onclick = (function (e) {
      switch (mode) {
        case 0:
          date.setMonth(date.getMonth() + 1, 1);
          break;
        case 1:
          date.setDate(date.getDate() + 7);
          break;
        case 2:
          date.setDate(date.getDate() + 1);
          break;
      }
      this.updateUI();
      if (this.nextClicked) {
        this.nextClicked(mode, date);
      }
    }).bind(this);

    this.getDate = function () {
      return date;
    }

    this.getMode = function () {
      return mode;
    }

    this.setMode = function (newMode) {
      mode = newMode;
      date = new Date();
      switch (mode) {
        case 0:
          date.setDate(1);
          break;
        case 1:
          date.setDate(date.getDate() - date.getDay());
          break;
        case 2:
          // NOP
          break;
      }
      this.updateUI();
    };

    this.updateUI = function () {
      switch (mode) {
        case 0:
          bigText.textContent = date.getMonth() + 1;
          detailText.textContent = date.getFullYear();
          break;
        case 1:
          var tempDate = new Date(date);
          tempDate.setDate(date.getDate() + 6);
          bigText.textContent = date.getDate() + '~' + tempDate.getDate();
          detailText.textContent = date.getFullYear() + '-' + (date.getMonth() + 1);
          break;
        case 2:
          bigText.textContent = date.getDate();
          detailText.textContent = date.getFullYear() + '-' + (date.getMonth() + 1);
          break;
      }
    };

    this.setMode(0);
  }

  function PlannerView(baseElement, clientCore) {
    this.element = baseElement;

    var mode = 0;
    var spinner = new DateSpinner(document.getElementById('planner-date-spinner'));
    var leftContents = this.element.getElementsByClassName('contents')[0];
    var rightContents = this.element.getElementsByClassName('contents')[1];
    var leftTable = document.createElement('table');
    var rightTable = document.createElement('table');
    var modeButtons = this.element.getElementsByClassName('mode-btn');
    var planner = null;
    var schedules = [];

    leftContents.getElementsByTagName('header')[0].appendChild(spinner.element);
    for (var i = 0; i < modeButtons.length; i++) {
      (function (x) {
        modeButtons[x].onclick = (function (e) {
          this.setMode(x);
        }).bind(this);
      }).call(this, i);
    }
    leftContents.getElementsByClassName('table-container')[0].appendChild(leftTable);
    rightContents.getElementsByClassName('table-container')[0].appendChild(rightTable);

    spinner.prevClicked = (function (mode, date) {
      this.updateUI();
    }).bind(this);
    spinner.nextClicked = (function (mode, date) {
      this.updateUI();
    }).bind(this);

    function buildTableContents(side) {
      var tblMarkup = '';
      var header;
      switch (side) {
        case 'left':
          header = '<thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th></tr></thead>';
          break;
        default:
          header = '<thead><tr><th>Thu</th><th>Fri</th><th>Sat</th><th>&nbsp;</th></tr></thead>';
          break;
      }
      tblMarkup += header + '<tbody class="small">';
      var row = '<tr><td><div></div></td><td><div></div></td><td><div></div></td><td><div></div></td></tr>';
      switch (mode) {
        case 0:
          for (var i = 0; i < 6; i++) { tblMarkup += row; }
          break;
        case 1:
          tblMarkup += row;
          break;
      }
      tblMarkup += '</tbody>';
      return tblMarkup;
    }

    function getTableCell(row, col) {
      var tbl = col < 4 ? leftTable : rightTable;
      var subCol = col % 4;
      var row = tbl.getElementsByTagName('tbody')[0].getElementsByTagName('tr')[row];
      return row.getElementsByTagName('td')[subCol].getElementsByTagName('div')[0];
    }

    this.setMode = function (newMode) {
      spinner.setMode(newMode);
      mode = newMode;
      this.updateUI();
    };

    this.setPlanner = function (newPlanner) {
      planner = newPlanner;
      this.updateUI();
    }

    this.updateUI = function () {
      leftTable.innerHTML = buildTableContents('left');
      rightTable.innerHTML = buildTableContents('right');
      if (!clientCore || !planner) {
        return;
      }
      clientCore.getSchedules(
        planner.id,
        [spinner.getDate().getFullYear(), spinner.getDate().getMonth() + 1],
        function (s, response) {
          switch (mode) {
            case 0:
              var tempDate = new Date(spinner.getDate());
              tempDate.setMonth(tempDate.getMonth() + 1, 0);
              var numOfDays = tempDate.getDate();
              tempDate.setDate(1);
              var cellIdx = tempDate.getDay();
              for (var i = 1; i <= numOfDays; i++, cellIdx++) {
                getTableCell(Math.floor(cellIdx / 7), cellIdx % 7).innerHTML += i + '<br>';
              }
              for (var i in response) {
                var startDate = new Date(response[i].startsAt);
                var listItem = new ScheduleListItem(response[i]);
                cellIdx = startDate.getDate() + tempDate.getDay() - 1;
                getTableCell(Math.floor(cellIdx / 7), cellIdx % 7).appendChild(listItem.element);
              }
              break;
            case 1:
              var tempDate = new Date(spinner.getDate());
              for (var i = 0; i < 7; i++, tempDate.setDate(tempDate.getDate() + 1)) {
                getTableCell(0, i).innerHTML += tempDate.getDate() + '<br>';
              }
              break;
          }
        },
        null
      );
    };

    this.setMode(0);
  }

  function ScheduleListItem(schedule) {
    var schedule = schedule;
    var e = document.createElement('div');
    e.className = 'schedule-list-item';
    var contents = '<div class="labels">';
    for (var i in schedule.labels) {
      contents += '<div class="label" style="background-color:' + schedule.labels[i].color + '"></div>';
    }
    contents += '</div>' + schedule.title;
    e.innerHTML = contents;
    this.element = e;
  }

  function Client(serviceUrl) {
    var core = new win.plannerClientLib.AjaxWrapper(serviceUrl);
    var rootElement = document.getElementById('app-main');
    var mainElement = rootElement.getElementsByTagName('main')[0];
    var uiSection = {
      signInForm: new SignInForm(document.getElementById('signin-form')),
      plannerList: new PlannerList(document.getElementById('planner-list')),
      plannerView: new PlannerView(document.getElementById('planner-view'), core)
    };
    var currentUI = null;

    function doSignIn(user) {
      document.getElementById('user-settings').textContent = user.fullName;
      uiHandover(uiSection.plannerList);
    }

    function uiHandover(newUI) {
      currentUI = newUI;
      mainElement.style.opacity = '0';
      setTimeout(function () {
        mainElement.innerHTML = '';
        if (currentUI && currentUI.element) {
          if (currentUI.onHandover) {
            currentUI.onHandover.call(currentUI);
          }
          mainElement.appendChild(currentUI.element);
        }
        mainElement.style.opacity = '1';
      }, 600);
    }

    uiSection.signInForm.onHandover = function () {
      this.reset();
      this.updateUI();
    }
    uiSection.signInForm.submitClicked = function (email, fullName, password, confirm) {
      switch (this.mode) {
        case 0: // sign-in
          core.signIn(email, password, (function (s, user) {
            doSignIn(user);
          }).bind(this), (function (s, e) {
            this.setError(e.error.message);
          }).bind(this));
          break;

        case 1: // create account
          this.setError('not implemented');
          break;
      }
    };
    uiSection.plannerList.onHandover = function () {
      core.getAllPlanners(
        (function (s, list) {
          this.planners = list;
          this.updateUI();
        }).bind(this),
        null
      );
    };
    uiSection.plannerList.itemClicked = function (selectedPlanner) {
      uiSection.plannerView.setPlanner(selectedPlanner);
      uiHandover(uiSection.plannerView);
    };
    uiSection.plannerView.onHandover = function () {
      this.updateUI();
    }

    if (localStorage.plannerUserToken) {
      core.getUserInfo(
        function (s, user) { doSignIn(user); },
        function (s, e) { uiHandover(uiSection.signInForm); }
      );
    } else {
      uiHandover(uiSection.signInForm);
    }
  }

  win.onload = function (e) {
    win.app = {};
    var client = new Client('http://localhost:3000/api');
    //var signInForm = new SignInForm(document.getElementById('signin-form'));
    //var plannerList = new PlannerList(document.getElementById('planner-list'));
  }
})(window);
