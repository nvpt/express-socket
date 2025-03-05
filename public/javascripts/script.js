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
  const messagesListItem = $('.chat .messages-list-item');

  const validate = () => {
    if ($('#messageInput').val().length) {
      // tslint:disable-next-line:no-console
      console.log(`16`);

      $('#submitMessage').prop('disabled', false);
    } else {
      // tslint:disable-next-line:no-console
      console.log(`21`);

      $('#submitMessage').prop('disabled', true);
    }
  };

  validate();
  $('#messageInput').on('input', validate);


  loginForm.submit((event) => {
    event.preventDefault();
    socket.emit('login', nickname.val());
  });

  messageForm.submit((event) => {
    event.preventDefault();
    socket.emit('message', messageField.val());
    messageField.val('');
  });

  //#region Listeners
  socket.on('loginResponse', (loginResponse) => {

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

  });

  socket.on('new message', (newMessage) => {
// tslint:disable-next-line:no-console
    console.log('40 >>> newMessage: \n', newMessage);
    const message = `
          <li class="messages-list-item">
            <a href="#"
               class="list-group-item list-group-item-action">
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">User name</h5>
                <small class="text-muted">${ new Date(newMessage.time).getHours() } : ${ new Date(newMessage.time).getMinutes() }</small>
              </div>
              <p class="mb-1">${ newMessage.message }</p>
            </a>
          </li>`;

    messagesList.append(message);

  });

  socket.on('users', (users) => {

  });
  //#endregion Listeners
});
