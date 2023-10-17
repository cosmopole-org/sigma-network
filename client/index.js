
let { io } = require('socket.io-client')

let socket = io('http://localhost:3000')
socket.emit('human/signUp', { email: 'test@test.com' }, (response1) => {
    console.log(response1);
    socket.emit('human/verify', { cCode: response1.cCode, vCode: '123' }, (response2) => {
        console.log(response2);
        socket.emit('human/complete', { cCode: response1.cCode, firstName: 'edward', lastName: 'kasperian' }, (response3) => {
            console.log(response3);
        });
    });
});
