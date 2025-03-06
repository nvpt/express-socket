$(document).ready(() => {
  const socket = io();
  const nickname = $('.login-form-container #nickname');
  const loginForm = $('.login-form-container .login-form');
  const inputError = $('.login-form-container .input-error');
  const messageForm = $('.message-form');
  const messageField = $('.message-form #messageInput');
  const usersListContainer = $('#usersListContainer');
  const usersList = $('#usersList');
  const messages = $('.chat .messages');
  const messagesList = $('#messagesList');
  let cachedNickName = '';

  const validate = () => {
    if ($('#messageInput').val().length) {
      $('#submitMessage').prop('disabled', false);
    } else {
      $('#submitMessage').prop('disabled', true);
    }
  };

  validate();
  $('#messageInput').on('input', validate);


  loginForm.submit((event) => {
    event.preventDefault();
    cachedNickName = nickname.val();
    socket.emit('login', nickname.val());
  });

  messageForm.submit((event) => {
    event.preventDefault();
    socket.emit('message', messageField.val());
    messageField.val('');
  });

  //#region Listeners
  socket.on('loginResponse', (loginResponse) => {

    if (nickname.val() === loginResponse.nickname) {
      if (loginResponse.status.toLowerCase() === 'ok') {
        inputError.addClass('d-none');
        nickname.removeClass('invalid');
        loginForm.addClass('d-none');
        messageForm.removeClass('d-none');
        usersListContainer.removeClass('d-none');
        messages.removeClass('d-none');
      } else {
        inputError.removeClass('d-none');
        nickname.addClass('invalid');
      }
    }
  });

  /* Рендер нового сообщения */
  socket.on('new message', (newMessage) => {
    const dateOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const parsedDate = new Date(newMessage.date).toLocaleDateString('ru-RU', dateOptions);
    const parsedTime = new Date(newMessage.date).toLocaleTimeString('ru-RU', timeOptions);

    let message = '';

    if (newMessage.isLeftChat && newMessage.nickname !== cachedNickName) {
      message = `
          <li class="messages-list-item">
            <a href="#"
               class="list-group-item list-group-item-action  message-wrap">
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1"></h5>
                <small class="text-muted">${ parsedDate }, ${ parsedTime }</small>
              </div>
              <p class="mb-1 message alert">Пользователь ${ newMessage.nickname } покинул чат.</p>
            </a>
          </li>`;
    } else {
      message = `
          <li class="messages-list-item">
            <a href="#"
               class="list-group-item list-group-item-action  message-wrap ${ cachedNickName === newMessage.nickname ? 'current' : '' }">
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${ newMessage.nickname }</h5>
                <small class="text-muted">${ parsedDate }, ${ parsedTime }</small>
              </div>
              <p class="mb-1 message">${ newMessage.message || '' }</p>
            </a>
          </li>`;
    }


    messagesList.append(message);
  });

  /* Рендер списка пользователей */
  socket.on('users', ({ users }) => {
    usersList.text('');

    if (users && users.length) {
      users.forEach(user => {
        const element = `<li class="list-group-item user ${ user === cachedNickName ? 'current' : '' }">${ user }</li>`;
        usersList.append(element);
      });
    } else {
      usersList.text('');
    }
  });
  //#endregion Listeners

  //#region Before leave page
  $(window).bind('beforeunload', function () {
    cachedNickName = '';
  });
  //#endregion Before leave page

});
