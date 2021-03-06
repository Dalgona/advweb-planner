(function (win) {
  /** @type {{start: (modalObj: object) => void, end: () => void}} */
  var modal;
  /** @type {{show: (x: number, y: number, menu: object) => void, closeAll: () => void}} */
  var dropdownManager;

  function getModalObj() {
    var container = document.getElementById('modal-container');
    var fader = container.getElementsByClassName('fader')[0];
    var contentsArea = container.getElementsByClassName('contents')[0];

    return {
      start: function (modalObj) {
        container.style.display = 'block';
        setTimeout(function () {
          fader.style.opacity = '1';
          contentsArea.appendChild(modalObj.element);
        }, 10);
      },
      end: function () {
        contentsArea.innerHTML = '';
        fader.style.opacity = '0';
        setTimeout(function () {
          container.style.display = 'none';
        }, 550);
      }
    };
  }

  function getDropdownManager() {
    var container = document.getElementById('dropdown-container');

    return {
      show: function (x, y, menu) {
        this.closeAll();
        var elem = menu.element;
        container.appendChild(elem);
        var scrWidth = win.innerWidth;
        var scrHeight = win.innerHeight;
        var menuWidth = parseFloat(win.getComputedStyle(elem).width);
        var menuHeight = parseFloat(win.getComputedStyle(elem).height);
        var newX = Math.min(scrWidth - menuWidth - 5, Math.max(5, x));
        var newY = Math.min(scrHeight - menuHeight - 5, Math.max(5, y));
        elem.style.top = newY + 'px';
        elem.style.left = newX + 'px';
      },
      closeAll: function () {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    }
  }

  /**
   * @param {string} eventName
   * @param {Function} handler
   */
  HTMLCollection.prototype.addEventListeners = function (eventName, handler) {
    var thisCollection = this;
    for (var i = 0; i < this.length; i++) {
      this[i].addEventListener(eventName, handler, false);
    }
  };

  function TopTabs(baseElement) {
    var that = this;
    var elem = baseElement;
    var tabs = elem.getElementsByClassName('tab');

    this.currentTab = 0;
    this.element = elem;

    for (var i = 0; i < tabs.length; i++) {
      (function (index) {
        tabs[index].onclick = function (e) {
          that.currentTab = index;
          if (that.tabChanged) {
            that.tabChanged.call(that, that.currentTab);
          }
          that.updateUI();
        };
      })(i);
    }

    /** @type {(tabIndex: number) => void} */
    this.tabChanged = null;

    this.updateUI = function () {
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
      }
      tabs[this.currentTab].classList.add('active');
    };
  }

  function DropdownMenu() {
    var that = this;
    var elem = document.createElement('div');
    /** @type {[HTMLDivElement]} */
    var itemElements = [];

    function addItem(title) {
      var e = document.createElement('div');
      e.className = 'dropdown-item disabled';
      e.textContent = title;
      e.onclick = emptyClickHandler;
      itemElements.push(e);
      elem.appendChild(e);
    }

    function addSeparator() {
      var e = document.createElement('div');
      e.className = 'dropdown-separator';
      e.onclick = emptyClickHandler;
      elem.appendChild(e);
    }

    function emptyClickHandler(e) {
      e.stopPropagation();
    }

    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] === '---') {
        addSeparator();
      } else {
        addItem(arguments[i]);
      }
    }

    elem.className = 'dropdown-menu';

    this.element = elem;

    this.itemClicked = function (itemIndex, handler) {
      var elem = itemElements[itemIndex];
      if (handler) {
        elem.onclick = function (e) {
          handler.call(this, e);
          dropdownManager.closeAll();
          e.stopPropagation();
        };
        elem.classList.remove('disabled');
      } else {
        elem.onclick = emptyClickHandler;
        elem.classList.add('disabled');
      }
    };
  }

  function SignInForm(baseElement) {
    this.element = baseElement;
    this.mode = 0; // 0: sign-in, 1: create account
    this.submitClicked = null;

    var that = this;
    var tabs = new TopTabs(this.element.getElementsByClassName('top-tabs')[0]);
    tabs.tabChanged = function (tabIndex) {
      that.mode = tabIndex;
      that.updateUI();
    };

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
    };

    /**
     * Checks if the values of two password fields match.
     */
    this.passwordMatches = function () {
      if (this.mode == 0) {
        return true;
      }
      return inputFields[2].value === inputFields[3].value;
    };

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
    };

    this.onHandover = function () {
      this.reset();
      this.updateUI();
    };

    this.updateUI = function () {
      var elemForSignIn = this.element.getElementsByClassName('for-signin');
      var elemForSignUp = this.element.getElementsByClassName('for-signup');
      this.setError();
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

  function PlannerList(baseElement, clientCore) {
    this.element = baseElement;
    this.addNewClicked = null;
    this.itemClicked = null;

    var that = this;
    var planners = {};
    var listElement = this.element.getElementsByClassName('list')[0];
    var addNewButton = this.element.getElementsByClassName('add-new')[0];

    addNewButton.addEventListener('click', function (e) {
      var dialog = new NewPlannerModal();
      dialog.submitClicked = function (title) {
        clientCore.createPlanner({title: title},
          function (s, planner) {
            planners[planner.id] = planner;
            that.updateUI();
            modal.end();
          },
          function (s, e) {
            that.setError(e.error.message);
          },
        );
      };
      modal.start(dialog);
    }, false);

    this.updateUI = function () {
      while (listElement.firstChild) {
        listElement.removeChild(listElement.firstChild);
      }
      for (var i in planners) {
        listElement.appendChild(createItemElement(planners[i]));
      }
      listElement.appendChild(addNewButton);
    };

    this.onHandover = function () {
      clientCore.getAllPlanners(
        function (s, list) {
          planners = {};
          for (var i in list) {
            planners[list[i].id] = list[i];
          }
          that.updateUI();
        },
        null
      );
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

  function DateSpinner() {
    this.element = document.getElementById('planner-date-spinner').cloneNode(true);
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

  function CalendarView(host, clientCore) {
    /* TODO: add mode buttons on the right page */
    var mode = 0;
    var template = document.getElementById('template-paper');
    var spinner = new DateSpinner();
    var left = template.cloneNode(true);
    var right = template.cloneNode(true);
    var leftTable = document.createElement('table');
    var rightTable = document.createElement('table');
    var addScheduleBtn = document.createElement('button');
    var planner = null;

    left.id = '';
    right.id = '';
    this.leftElement = left;
    this.rightElement = right;

    left.getElementsByTagName('header')[0].appendChild(spinner.element);
    spinner.prevClicked = (function (mode, date) {
      this.updateUI();
    }).bind(this);
    spinner.nextClicked = (function (mode, date) {
      this.updateUI();
    }).bind(this);

    right.getElementsByTagName('header')[0].appendChild(addScheduleBtn);
    addScheduleBtn.className = 'tinted';
    addScheduleBtn.type = 'button';
    addScheduleBtn.textContent = 'New Schedule';
    addScheduleBtn.onclick = function (e) {
      host.newScheduleClicked(planner);
    };

    leftTable.className = rightTable.className = 'calendar';
    left.getElementsByClassName('main')[0].appendChild(leftTable);
    right.getElementsByClassName('main')[0].appendChild(rightTable);

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

    this.getMode = function () {
      return mode;
    }

    this.setMode = function (newMode) {
      mode = newMode;
      spinner.setMode(newMode);
      this.updateUI();
    }

    this.setPlanner = function (newPlanner) {
      planner = newPlanner;
      this.updateUI();
    };

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
                var listItem = new ScheduleListItem(host, response[i]);
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
    }
  }

  function TodoListView(host, clientCore) {
    var that = this;
    var left = document.getElementById('todo-lists').cloneNode(true);
    var right = document.getElementById('todo-details').cloneNode(true);
    var leftTable = left.getElementsByTagName('table')[0];
    var leftTbody = leftTable.getElementsByTagName('tbody')[0];
    var newListForm = left.getElementsByTagName('form')[0];
    var detailsView = new TodoListDetailsView(that, right, clientCore);
    var planner = null;
    var todoLists = {};

    left.id = '';
    right.id = '';
    this.leftElement = left;
    this.rightElement = right;

    newListForm.onsubmit = function (e) {
      var thisForm = this;
      clientCore.createTodoList(planner.id, {title: this.title.value},
        function (s, newList) {
          var row = new TodoListTableRow(that, newList);
          todoLists[newList.id] = newList;
          leftTbody.appendChild(row.element);
          thisForm.reset();
        }, function (s, e) {
          console.warn(e);
        }
      );
      return false;
    };

    function buildListTable() {
      for (var i in todoLists) {
        var row = new TodoListTableRow(that, todoLists[i]);
        leftTbody.appendChild(row.element);
      }
    }

    this.todoListClicked = function (todoList) {
      var rows = leftTbody.getElementsByTagName('tr');
      for (var i = 0; i < rows.length; i++) {
        rows[i].classList.remove('selected');
      }
      this.classList.add('selected');
      detailsView.setTodoList(todoList);
    };

    this.todoListUpdating = function (list, item) {
      clientCore.getTodoList(list.id,
        function (s, newList) {
          todoLists[newList.id] = newList;
          that.updateUI();
        }, function (s, e) {
          console.warn(e);
        }
      );
    };

    this.todoListDeleting = function (todoList) {
      var rowToBeDeleted = this;
      var msg = 'Are you sure you want to delete this to-do list?\n(This cannot be undone.)';
      if (confirm(msg)) {
        clientCore.deleteTodoList(todoList.id,
          function (s, r) {
            leftTbody.removeChild(rowToBeDeleted);
            detailsView.setTodoList(null);
            delete todoLists[todoList.id];
          }, function (s, e) {
            console.log(e);
          }
        );
      }
    };

    this.setPlanner = function (newPlanner) {
      planner = newPlanner;
      clientCore.getAllTodoLists(planner.id,
        function (s, list) {
          for (var i in list) {
            todoLists[list[i].id] = list[i];
          }
          that.updateUI();
        }, function (s, e) {
          console.warn(e);
        }
      );
      this.updateUI();
    };

    this.updateUI = function () {
      while (leftTbody.firstChild) {
        leftTbody.removeChild(leftTbody.firstChild);
      }
      buildListTable();
    };
  }

  function TodoListTableRow(host, todoList) {
    var elem = document.createElement('tr');
    var titleCell = document.createElement('td');
    var chkCell = document.createElement('td');
    var delCell = document.createElement('td');
    var chkbox = document.createElement('input');
    var delbtn = document.createElement('button');

    if (todoList.complete) {
      elem.classList.add('complete');
    }

    chkCell.className = 'col-complete';
    titleCell.className = 'col-title';
    delCell.className = 'col-delete';
    chkbox.type = 'checkbox';
    chkbox.disabled = true;
    chkbox.checked = todoList.complete;
    titleCell.textContent = todoList.title;
    delbtn.type = 'button';

    chkCell.appendChild(chkbox);
    delCell.appendChild(delbtn);
    elem.appendChild(chkCell);
    elem.appendChild(titleCell);
    elem.appendChild(delCell);

    elem.onclick = function (e) {
      if (host.todoListClicked) {
        host.todoListClicked.call(this, todoList);
      }
    };

    delbtn.onclick = function (e) {
      if (host.todoListDeleting) {
        host.todoListDeleting.call(elem, todoList);
      }
      e.stopPropagation();
    };

    this.element = elem;
  }

  function TodoListDetailsView(host, baseElement, clientCore) {
    var that = this;
    var elem = baseElement;
    var placeholder = document.getElementById('todo-details-placeholder').cloneNode(true);
    var origContents = elem.getElementsByClassName('contents')[0];
    var title = elem.getElementsByClassName('list-title')[0];
    var table = elem.getElementsByTagName('table')[0];
    var tbody = table.getElementsByTagName('tbody')[0];
    var newItemForm = elem.getElementsByTagName('form')[0];
    var todoList = null;

    function buildListTable() {
      for (var i in todoList.items) {
        var row = new TodoItemTableRow(that, todoList.items[i]);
        tbody.appendChild(row.element);
      }
    }

    elem.replaceChild(placeholder, elem.firstElementChild);

    newItemForm.onsubmit = function (e) {
      var thisForm = this;
      clientCore.createTodoItem(todoList.id, {title: thisForm.title.value},
        function (s, newItem) {
          var row = new TodoItemTableRow(that, newItem);
          tbody.appendChild(row.element);
          if (host.todoListUpdating) {
            host.todoListUpdating(todoList, newItem);
          }
          thisForm.reset();
        }, function (s, e) {
          console.warn(e);
        }
      );
      return false;
    };

    this.todoItemUpdating = function (todoItem) {
      var chkbox = this;
      clientCore.updateTodoItem(todoItem.id, {complete: chkbox.checked},
        function (s, list) {
          if (host.todoListUpdating) {
            host.todoListUpdating(todoList, todoItem);
          }
        }, function (s, e) {
          console.log(e);
        }
      );
    };

    this.todoItemDeleting = function (todoItem) {
      var rowToBeDeleted = this;
      clientCore.deleteTodoListItem(todoItem.id,
        function (s, r) {
          tbody.removeChild(rowToBeDeleted);
          if (host.todoListUpdating) {
            host.todoListUpdating(todoList, null);
          }
        }, function (s, e) {
          console.warn(e);
        }
      );
    };

    this.setTodoList = function (newTodoList) {
      todoList = newTodoList;
      if (!todoList) {
        elem.replaceChild(placeholder, elem.firstElementChild);
      } else {
        elem.replaceChild(origContents, elem.firstElementChild);
        title.textContent = todoList.title;
        while (tbody.firstChild) {
          tbody.removeChild(tbody.firstChild);
        }
        buildListTable();
      }
    };
  }

  function TodoItemTableRow(host, todoItem) {
    var elem = document.createElement('tr');
    var chkCell = document.createElement('td');
    var titleCell = document.createElement('td');
    var delCell = document.createElement('td');
    var chkbox = document.createElement('input');
    var delbtn = document.createElement('button');

    if (todoItem.complete) {
      elem.classList.add('complete');
    }

    chkCell.className = 'col-complete';
    titleCell.className = 'col-title';
    delCell.className = 'col-delete';
    chkbox.type = 'checkbox';
    chkbox.checked = todoItem.complete;
    titleCell.textContent = todoItem.title;
    delbtn.type = 'button';

    chkCell.appendChild(chkbox);
    delCell.appendChild(delbtn);
    elem.appendChild(chkCell);
    elem.appendChild(titleCell);
    elem.appendChild(delCell);

    chkbox.onchange = function (e) {
      elem.classList[this.checked ? 'add' : 'remove']('complete');
      if (host.todoItemUpdating) {
        host.todoItemUpdating.call(this, todoItem);
      }
      e.stopPropagation();
    };

    delbtn.onclick = function (e) {
      if (host.todoItemDeleting) {
        host.todoItemDeleting.call(elem, todoItem);
      }
    };

    this.element = elem;
  }

  function DateTimePicker(name) {
    var that = this;
    var elem = document.getElementById('template-datetime-picker').cloneNode(true);
    var date = new Date();
    this.element = elem;
    this.valueChanged = null;

    date.setSeconds(0, 0);
    elem.id = '';
    var inputs = elem.getElementsByTagName('input');
    var selects = elem.getElementsByTagName('select');
    var allFields = Array.from(inputs).concat(Array.from(selects));
    for (var i = 0; i < allFields.length; i++) {
      allFields[i].name = name + '_' + allFields[i].name;
    }
    for (var i = 0; i < 24; i++) {
      var opt = new Option('' + i, '' + i);
      selects[0].appendChild(opt);
    }
    for (var i = 0; i < 12; i++) {
      var opt = new Option('' + (i * 5), '' + (i * 5));
      selects[1].appendChild(opt);
    }

    function changeHandler() {
      if (that.valueChanged) {
        that.valueChanged.call(that);
      }
      that.updateUI();
    }

    inputs[0].onchange = function (e) {
      date.setFullYear(this.value);
      changeHandler();
    };
    inputs[1].onchange = function (e) {
      date.setMonth(this.value - 1);
      changeHandler();
    };
    inputs[2].onchange = function (e) {
      date.setDate(this.value);
      changeHandler();
    };
    selects[0].onchange = function (e) {
      date.setHours(this.value);
      changeHandler();
    };
    selects[1].onchange = function (e) {
      date.setMinutes(this.value);
      changeHandler();
    };

    this.setDate = function (newDate) {
      date = new Date(newDate);
      this.updateUI();
    }

    this.getDate = function () {
      return date;
    }

    this.setEnabled = function (enabled) {
      for (var i = 0; i < allFields.length; i++) {
        allFields[i].disabled = !enabled;
      }
    }

    this.updateUI = function () {
      inputs[0].value = date.getFullYear();
      inputs[1].value = date.getMonth() + 1;
      inputs[2].value = date.getDate();
      selects[0].value = date.getHours();
      selects[1].value = (Math.floor(date.getMinutes() / 5)) * 5;
    }

    this.updateUI();
  }

  function ScheduleDetailsView(host, target, clientCore) {
    var elem = document.getElementById('schedule-details').cloneNode(true);
    var form = elem.getElementsByTagName('form')[0];
    var titleElem = elem.getElementsByClassName('details-title')[0];
    var startPicker = new DateTimePicker('starts_at');
    var endPicker = new DateTimePicker('ends_at');
    this.element = elem;

    elem.getElementsByClassName('start-date-picker')[0].appendChild(startPicker.element);
    elem.getElementsByClassName('end-date-picker')[0].appendChild(endPicker.element);

    if (target.schedule) {
      titleElem.textContent = 'Schedule Details';
      form.title.value = target.schedule.title;
      form.location.value = target.schedule.location;
      form.description.value = target.schedule.description;
      form.allday.checked = target.schedule.allday;
      startPicker.setDate(target.schedule.startsAt);
      endPicker.setDate(target.schedule.endsAt);
    } else {
      titleElem.textContent = 'New Schedule';
      form.delete.disabled = true;
      form.delete.style.display = 'none';
    }

    if (form.allday.checked) {
      endPicker.setDate(startPicker.getDate());
      endPicker.setEnabled(false);
    }

    form.allday.onchange = function (e) {
      endPicker.setEnabled(!this.checked);
    };

    startPicker.valueChanged = endPicker.valueChanged = function () {
      var sd = startPicker.getDate();
      var ed = endPicker.getDate();
      if (sd.getTime() > ed.getTime()) {
        endPicker.setDate(sd);
      }
    };

    form.onsubmit = function (e) {
      var args = {
        title: form.title.value,
        location: form.location.value,
        description: form.description.value,
        startsAt: startPicker.getDate(),
        endsAt: endPicker.getDate(),
        allday: form.allday.checked,
        labels: ''
      }
      var updateFunction =
        target.schedule
        ? clientCore.updateSchedule.bind(clientCore, target.schedule.id)
        : clientCore.createSchedule.bind(clientCore, target.planner.id);
      updateFunction(args,
        function (s, schedule) { host.detailsClosing(); },
        function (s, e) { console.warn(e); }
      );
      return false;
    };

    form.delete.onclick = function (e) {
      var message = 'Are you sure you want to delete this schedule?\n(This cannot be undone.)';
      if (confirm(message)) {
        clientCore.deleteSchedule(target.schedule.id,
          function (s, res) { host.detailsClosing(); },
          function (s, e) { console.warn(e); }
        );
      }
    }

    form.cancel.onclick = function (e) {
      host.detailsClosing();
    };
  }

  function PlannerView(host, planner, clientCore) {
    var that = this;
    var mode = 0;
    var elem = document.getElementById('planner-view').cloneNode('true');
    var calendar = new CalendarView(this, clientCore);
    var todoList = new TodoListView(this, clientCore);
    var subViews = [calendar, todoList];
    var tabs = elem.getElementsByClassName('tab');
    var leftContainer = elem.getElementsByClassName('left')[0];
    var rightContainer = elem.getElementsByClassName('right')[0];
    var leftStack = [];
    var rightStack = [];
    this.element = elem;

    function modalUpdateClicked(updateArgs) {
      modal.end();
      clientCore.updatePlanner(planner.id, updateArgs,
        function (s, newPlaner) {
          if (that.plannerUpdating) {
            that.plannerUpdating.call(planner, updateArgs.title);
          }
        }, function (s, e) {
          console.warn(e);
        }
      );
    }

    function modalDeleteClicked(deleteArgs) {
      modal.end();
      clientCore.deletePlanner(planner.id, deleteArgs,
        function (s, response) {
          if (that.plannerDeleting) {
            that.plannerDeleting.call(planner);
          }
        }, function (s, e) {
          console.warn(e);
        }
      );
    }

    for (var i = 0; i < tabs.length - 1; i++) {
      (function (index) {
        tabs[index].onclick = (function (e) {
          this.setView(index);
        }).bind(this);
      }).call(this, i);
    }

    tabs[tabs.length - 1].onclick = (function (e) {
      var dialog = new PlannerSettingsModal(planner);
      dialog.updateClicked = modalUpdateClicked;
      dialog.deleteClicked = modalDeleteClicked;
      modal.start(dialog);
    }).bind(this);

    this.setView = function (index) {
      leftStack = [subViews[index].leftElement];
      rightStack = [subViews[index].rightElement];
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
      }
      tabs[index].classList.add('active');
      this.updateUI();
    }

    this.setMode = function (newMode) {
      calendar.setMode(newMode);
      mode = newMode;
      this.updateUI();
    };

    this.setPlanner = function (newPlanner) {
      calendar.setPlanner(newPlanner);
      todoList.setPlanner(newPlanner);
      this.updateUI();
    };

    this.scheduleItemClicked = function (schedule) {
      var view = new ScheduleDetailsView(this, {schedule: schedule}, clientCore);
      rightStack.push(view.element);
      this.updateUI();
    };

    this.newScheduleClicked = function (planner) {
      var view = new ScheduleDetailsView(this, {planner: planner}, clientCore);
      rightStack.push(view.element);
      this.updateUI();
    };

    this.detailsClosing = function () {
      rightStack.pop();
      this.updateUI();
    };

    this.updateUI = function () {
      calendar.updateUI();

      leftContainer.innerHTML = rightContainer.innerHTML = '';
      leftContainer.appendChild(leftStack[leftStack.length - 1]);
      rightContainer.appendChild(rightStack[rightStack.length - 1]);
    };

    this.onHandover = function () {
      this.updateUI();
    };

    /** @type {(newTitle: string) => void} */
    this.plannerUpdating = null;

    /** @type {() => void} */
    this.plannerDeleting = null;

    this.setView(0);
    this.setMode(0);
    this.setPlanner(planner);
  }

  function ScheduleListItem(host, schedule) {
    var schedule = schedule;
    var e = document.createElement('div');
    e.className = 'schedule-list-item';
    var contents = '<div class="labels">';
    /*for (var i in schedule.labels) {
      contents += '<div class="label" style="background-color:' + schedule.labels[i].color + '"></div>';
    }*/
    contents += '</div>' + schedule.title;
    e.innerHTML = contents;
    e.onclick = host.scheduleItemClicked.bind(host, schedule);
    this.element = e;
  }

  function NewPlannerModal() {
    var that = this;
    var e = document.getElementById('modal-new-planner').cloneNode(true);
    e.id = '';
    var form = e.getElementsByTagName('form')[0];
    var errorMsg = e.getElementsByClassName('error-message')[0];

    form.onsubmit = function (e) {
      if (that.submitClicked) {
        that.submitClicked.call(that, form.title.value);
      }
      return false;
    };

    form.cancel.onclick = function (e) {
      modal.end();
    }

    this.element = e;

    /** @type {(title: string) => void} */
    this.submitClicked = null;

    this.setError = function (message) {
      if (!message) {
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
      } else {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
      }
    }
  }

  function PlannerSettingsModal(planner) {
    var that = this;
    var elem = document.getElementById('modal-planner-settings').cloneNode(true);
    var tabs = new TopTabs(elem.getElementsByClassName('top-tabs')[0]);
    var forms = elem.getElementsByTagName('form');
    var settingsForm = forms[0];
    var deleteForm = forms[1];

    settingsForm.title.value = planner.title;

    tabs.tabChanged = function (tabIndex) {
      that.updateUI();
    };

    settingsForm.cancel.onclick = deleteForm.cancel.onclick = function (e) {
      modal.end();
    };

    deleteForm.confirm.onkeyup = function (e) {
      deleteForm.submit.disabled = this.value !== planner.title;
    };

    settingsForm.onsubmit = function (e) {
      if (that.updateClicked) {
        that.updateClicked.call(that, {title: this.title.value});
      }
      return false;
    };

    deleteForm.onsubmit = function (e) {
      if (that.deleteClicked) {
        that.deleteClicked.call(that, {title: this.confirm.value});
      }
      return false;
    };

    this.updateUI = function () {
      for (var i = 0; i < forms.length; i++) {
        forms[i].style.display = 'none';
      }
      forms[tabs.currentTab].style.display = 'block';
    };

    elem.id = '';
    this.element = elem;
    this.updateUI();
  }

  function AccountSettingsModal(user) {
    var that = this;
    var elem = document.getElementById('modal-account-settings').cloneNode(true);
    var tabs = new TopTabs(elem.getElementsByClassName('top-tabs')[0]);
    var forms = elem.getElementsByTagName('form');
    var settingsForm = forms[0];
    var deleteForm = forms[1];

    function passwordMatches() {
      var allBlank =
        !settingsForm.currentPassword.value
        && !settingsForm.newPassword.value
        && !settingsForm.newConfirm.value;
      var matches =
        settingsForm.currentPassword.value
        && settingsForm.newPassword.value
        && settingsForm.newPassword.value == settingsForm.newConfirm.value;
      return allBlank || matches;
    }

    settingsForm._useremail.value = user.email;
    settingsForm.fullName.value = user.fullName;

    tabs.tabChanged = function (tabIndex) {
      that.updateUI();
    };

    settingsForm.getElementsByTagName('input').addEventListeners('keyup', function (e) {
      settingsForm.submit.disabled = !settingsForm.fullName.value || !passwordMatches();
    });

    deleteForm.getElementsByTagName('input').addEventListeners('keyup', function (e) {
      deleteForm.submit.disabled =
        deleteForm.email.value != user.email || !deleteForm.auth.value;
    });

    settingsForm.cancel.onclick = deleteForm.cancel.onclick = function (e) {
      modal.end();
    }

    settingsForm.onsubmit = function (e) {
      if (that.updateClicked) {
        that.updateClicked.call(that, {
          fullName: this.fullName.value,
          oldAuth: this.currentPassword.value,
          newAuth: this.newPassword.value
        });
      }
      return false;
    };

    deleteForm.onsubmit = function (e) {
      if (that.deleteClicked) {
        that.deleteClicked.call(that, {
          email: this.email.value,
          auth: this.auth.value
        });
      }
      return false;
    };

    this.updateUI = function () {
      for (var i = 0; i < forms.length; i++) {
        forms[i].style.display = 'none';
      }
      forms[tabs.currentTab].style.display = 'block';
    };

    this.setError = function (msg) {
      var errElem = forms[tabs.currentTab].getElementsByClassName('error-message')[0];
      if (!msg) {
        errElem.textContent = '';
        errElem.style.display = 'none';
      } else {
        errElem.textContent = msg;
        errElem.style.display = 'block';
      }
    }

    elem.id = '';
    this.element = elem;
    this.setError();
    this.updateUI();
  }

  function Client(serviceUrl) {
    var that = this;
    var core = new win.plannerClientLib.AjaxWrapper(serviceUrl);
    var rootElement = document.getElementById('app-main');
    var mainElement = rootElement.getElementsByTagName('main')[0];
    var appTitle = document.getElementById('app-title');
    var userButton = document.getElementById('user-settings');
    var origTitleText = appTitle.textContent;
    var signInForm = new SignInForm(document.getElementById('signin-form'));
    var plannerList = new PlannerList(document.getElementById('planner-list'), core);
    var userMenu = new DropdownMenu('Account Settings', 'Sign Out');
    var currentUI = null;
    var currentUser = null;

    function doSignIn(user) {
      currentUser = user;
      userButton.textContent = user.fullName;
      userButton.classList.add('active');
      uiHandover(plannerList);
    }

    function doSignOut() {
      userButton.textContent = 'Please Sign in';
      userButton.classList.remove('active');
      delete localStorage.plannerUserToken;
      setAppTitle();
      uiHandover(signInForm);
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

    function setAppTitle(title) {
      if (title) {
        appTitle.innerHTML = '<span><span class="icon arrow left"></span> &nbsp;' + title + '</span>';
        appTitle.classList.add('active');
      } else {
        appTitle.innerHTML = '<span>' + origTitleText + '</span>';
        appTitle.classList.remove('active');
      }
    }

    function plannerDeleting() {
      setAppTitle();
      uiHandover(plannerList);
    }

    function userUpdating(args) {
      var dialog = this;
      core.updateUserInfo(args,
        function (s, newUser) {
          currentUser = newUser;
          userButton.textContent = newUser.fullName;
          modal.end();
        }, function (s, e) {
          if (e.error) {
            dialog.setError(e.error.message);
          }
          console.warn(e);
        }
      );
    }

    function userDeleting(args) {
      var dialog = this;
      core.deleteUser(args,
        function (s, response) {
          doSignOut();
          modal.end();
        }, function (s, e) {
          if (e.error) {
            dialog.setError(e.error.message);
          }
          console.warn(e);
        }
      );
    }

    userMenu.itemClicked(0, function (e) {
      var dialog = new AccountSettingsModal(currentUser);
      dialog.updateClicked = userUpdating;
      dialog.deleteClicked = userDeleting;
      modal.start(dialog);
    })

    userMenu.itemClicked(1, function (e) {
      doSignOut();
    });

    signInForm.submitClicked = function (email, fullName, password, confirm) {
      var errHandler = (function (s, e) {
        this.setError(e.error.message);
      }).bind(this);

      switch (this.mode) {
        case 0: // sign-in
          core.signIn(email, password, (function (s, user) {
            doSignIn(user);
          }).bind(this), errHandler);
          break;

        case 1: // create account
          core.createUser({
            fullName: fullName,
            email: email,
            auth: password
          }, (function (s, user) {
            core.signIn(email, password, (function (s, user) {
              doSignIn(user);
            }).bind(this), errHandler);
          }).bind(this), errHandler);
          break;
      }
    };

    plannerList.itemClicked = function (selectedPlanner) {
      var plannerView = new PlannerView(that, selectedPlanner, core);
      plannerView.plannerUpdating = setAppTitle;
      plannerView.plannerDeleting = plannerDeleting;
      setAppTitle(selectedPlanner.title);
      uiHandover(plannerView);
    };

    appTitle.onclick = function (e) {
      if (this.classList.contains('active')) {
        setAppTitle();
        uiHandover(plannerList);
      }
    };

    userButton.onclick = function (e) {
      if (this.classList.contains('active')) {
        dropdownManager.show(2147483647, 48, userMenu);
        e.stopPropagation();
      }
    }

    setAppTitle();
    if (localStorage.plannerUserToken) {
      core.getUserInfo(
        function (s, user) { doSignIn(user); },
        function (s, e) { uiHandover(signInForm); }
      );
    } else {
      uiHandover(signInForm);
    }
  }

  win.PlannerClient = Client;

  win.addEventListener('load', function (e) {
    modal = getModalObj();
    dropdownManager = getDropdownManager();

    document.body.onclick = function (e) {
      dropdownManager.closeAll();
    };
  }, false);
})(window);
