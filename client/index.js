
let { io } = require('socket.io-client')

let socket = io('http://localhost:3000')
socket.emit('human/signUp', { email: 'test@test.com' }, (response) => {
    console.log(response);
});
