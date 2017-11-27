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

    var heights = [];
    var formItems = this.element.getElementsByClassName('form-item');
    for (var i = 0; i < formItems.length; i++) {
      var h = win.getComputedStyle(formItems[i]).height;
      heights.push(h);
      formItems[i].style.height = h;
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

  function Client(serviceUrl) {
    var core = new win.plannerClientLib.AjaxWrapper(serviceUrl);
    var rootElement = document.getElementById('app-main');
    var mainElement = rootElement.getElementsByTagName('main')[0];
    var uiSection = {
      signInForm: new SignInForm(document.getElementById('signin-form')),
      plannerList: new PlannerList(document.getElementById('planner-list'))
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
