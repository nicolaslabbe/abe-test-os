var usersList = {
  init: function (scope) {
    this._scope = scope;
    this._table = this._scope.querySelector('tbody');
    this._alert = document.querySelector('.alert');
    this._handleActivate = this._activate.bind(this);
    this._handleDeactivate = this._deactivate.bind(this);
    this._handleRemove = this._remove.bind(this);
    this._handleAdd = this._add.bind(this);

    this._bindEvents()
  },
  _bindEvents: function () {
      this._activateBtn = this._scope.querySelectorAll('[data-activate]')
      this._deactivateBtn = this._scope.querySelectorAll('[data-deactivate]')
      this._removeBtn = this._scope.querySelectorAll('[data-remove]')
      this._addBtn = this._scope.querySelector('[data-add-user]')

      Array.prototype.forEach.call(this._activateBtn, (btn) => {
        btn.removeEventListener('click', this._handleActivate)
        btn.addEventListener('click', this._handleActivate)
      })

      Array.prototype.forEach.call(this._deactivateBtn, (btn) => {
        btn.removeEventListener('click', this._handleDeactivate)
        btn.addEventListener('click', this._handleDeactivate)
      })

      Array.prototype.forEach.call(this._removeBtn, (btn) => {
        btn.removeEventListener('click', this._handleRemove)
        btn.addEventListener('click', this._handleRemove)
      })

      if(typeof this._addBtn !== 'undefined' && this._addBtn !== null) {
        this._addBtn.addEventListener('click', this._handleAdd)
      }
  },
  _activate: function (e) {
    var target = e.currentTarget;
    var id = target.getAttribute('data-user-id')
    minAjax({
      url:"/plugin/users/activate",
      type:"POST",
      data: {
        id: id
      },
      success: function(data) {
        target.classList.remove('glyphicon-eye-close', 'text-danger');
        target.classList.add('glyphicon-eye-open', 'text-info');
        target.removeEventListener('click', this._handleActivate)
        target.addEventListener('click', this._handleDeactivate)
      }
    });
  },
  _deactivate: function (e) {
    var target = e.currentTarget;
    var id = target.getAttribute('data-user-id')
    minAjax({
      url:"/plugin/users/deactivate",
      type:"POST",
      data: {
        id: id
      },
      success: function(data) {
        target.classList.remove('glyphicon-eye-open', 'text-info');
        target.classList.add('glyphicon-eye-close', 'text-danger');
        target.removeEventListener('click', this._handleDeactivate)
        target.addEventListener('click', this._handleActivate)
      }
    });
  },
  _remove: function (e) {
    var target = e.currentTarget;
    var id = target.getAttribute('data-user-id')
    minAjax({
      url:"/plugin/users/remove",
      type:"POST",
      data: {
        id: id
      },
      success: function(data) {
        target.parentNode.parentNode.remove()
      }
    });
  },
  _validateEmail: function(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
  },
  _add: function (e) {
    this._alert.classList.add('hidden');
    var target = e.currentTarget;
    var username = document.querySelector('[data-add-user-username]')
    if(typeof username.value === 'undefined' || username.value === null || username.value === '') {
      username.parentNode.classList.add('has-error')
      return 
    }
    username.parentNode.classList.remove('has-error')

    var name = document.querySelector('[data-add-user-name]')
    if(typeof name.value === 'undefined' || name.value === null || name.value === '') {
      name.parentNode.classList.add('has-error')
      return 
    }
    name.parentNode.classList.remove('has-error')

    var email = document.querySelector('[data-add-user-email]')
    if(typeof email.value === 'undefined' || email.value === null || email.value === '') {
      email.parentNode.classList.add('has-error');
      return 
    }
    if(!this._validateEmail(email.value)) {
      email.parentNode.classList.add('has-error');
      this._alert.classList.remove('hidden');
      this._alert.innerHTML = 'email is invalid';
      return;
    }
    email.parentNode.classList.remove('has-error')

    var password = document.querySelector('[data-add-user-password]')
    if(typeof password.value === 'undefined' || password.value === null || password.value === '') {
      password.parentNode.classList.add('has-error')
      return 
    }
    
    password.parentNode.classList.remove('has-error')

    var role = document.querySelector('[data-add-user-role]')

    minAjax({
      url:"/plugin/users/add",
      type:"POST",
      data: {
        username: username.value,
        name: name.value,
        email: email.value,
        password: password.value,
        role: role.value
      },
      success: function(data) {
        data = JSON.parse(data)
        if(data.success === 1) {
          var tr = document.createElement('tr')

          var tdUsername = document.createElement('td')
          tdUsername.innerHTML = data.user.username
          tr.appendChild(tdUsername)

          var tdName = document.createElement('td')
          tdName.innerHTML = data.user.name
          tr.appendChild(tdName)

          var tdEmail = document.createElement('td')
          tdEmail.innerHTML = data.user.email
          tr.appendChild(tdEmail)

          var tdPassord = document.createElement('td')
          // tdPassord.innerHTML = data.user.password
          tr.appendChild(tdPassord)

          var tdRole = document.createElement('td')
          tdRole.innerHTML = data.user.role.name
          tr.appendChild(tdRole)

          var tdActi = document.createElement('td')
          var glypEye = document.createElement('span')
          glypEye.classList.add('glyphicon', 'glyphicon-eye-close', 'text-danger')
          glypEye.setAttribute('data-activate', '')
          glypEye.setAttribute('data-user-id', data.user.id)
          glypEye.addEventListener('click', this._handleActivate)
          tdActi.appendChild(glypEye)
          tr.appendChild(tdActi)

          var tdRemove = document.createElement('td')
          var glypRemove = document.createElement('span')
          glypRemove.classList.add('glyphicon', 'glyphicon-trash', 'text-danger')
          glypRemove.setAttribute('data-remove', '')
          glypRemove.setAttribute('data-user-id', data.user.id)
          tdRemove.appendChild(glypRemove)
          glypRemove.addEventListener('click', this._handleRemove)
          tr.appendChild(tdRemove)

          this._table.insertBefore(tr, target.parentNode.parentNode)
      
          username.value = ""
          name.value = ""
          email.value = ""
          password.value = ""
        }else {
          this._alert.classList.remove('hidden');
          this._alert.innerHTML = data.message;
        }
      }.bind(this)
    });
  }
}

var userListEle = document.querySelector('.user-list');
if(typeof userListEle !== 'undefined' && userListEle !== null) {
  usersList.init(userListEle)
}