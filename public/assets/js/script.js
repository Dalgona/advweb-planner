(function (win) {
  function SignInForm(baseElement) {
    this.element = baseElement;
    this.mode = 0; // 0: sign-in, 1: create account

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

    /**
     * Reset the state of the sign-in form.
     */
    this.reset = function () {
      this.mode = 0;
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
            elemForSignIn[i].style.height = heights[elemForSignIn[i].getAttribute('data-index')];
            elemForSignIn[i].style.opacity = '1';
            if (i == elemForSignIn.length - 1) { break; }
            elemForSignIn[i].style.marginBottom = '0.25rem';
          }
          for (var i = 0; i < elemForSignUp.length; i++) {
            elemForSignUp[i].style.height = '0';
            elemForSignUp[i].style.opacity = '0';
            elemForSignUp[i].style.marginBottom = '0';
          }
          break;
        case 1:
          for (var i = 0; i < elemForSignIn.length; i++) {
            elemForSignIn[i].style.height = '0';
            elemForSignIn[i].style.opacity = '0';
            elemForSignIn[i].style.marginBottom = '0';
          }
          for (var i = 0; i < elemForSignUp.length; i++) {
            elemForSignUp[i].style.height = heights[elemForSignUp[i].getAttribute('data-index')];
            elemForSignUp[i].style.opacity = '1';
            if (i == elemForSignUp.length - 1) { break; }
            elemForSignUp[i].style.marginBottom = '0.25rem';
          }
          break;
      }
    }
    
    this.reset();
    this.updateUI();
  }

  win.onload = function (e) {
    win.app = {};
    var signInForm = new SignInForm(document.getElementById('signin-form'));
    win.app.signInForm = signInForm;
  }
})(window);
