
let { io } = require('socket.io-client')

let socket = io('http://localhost:3000')
socket.emit('human/signUp', { email: 'test@test.com' }, (response1) => {
    const rest = (humanId) => {
        socket.emit('human/readById', { targetHumanId: humanId }, (response5) => {
            console.log(response5);
            socket.emit('human/search', { query: 'edw' }, (response6) => {
                console.log(response6);
            });
        });
    }
    console.log(response1);
    socket.emit('human/verify', { cCode: response1.cCode, vCode: '123' }, (response2) => {
        console.log(response2);
        if (response2.session) {
            socket.emit('human/signIn', { token: response2.session.token }, (response4) => {
                console.log(response4);
                rest(response2.human.id)
            });
        } else {
            socket.emit('human/complete', { cCode: response1.cCode, firstName: 'edward', lastName: 'kasperian' }, (response3) => {
                console.log(response3);
                socket.emit('human/signIn', { token: response3.session.token }, (response4) => {
                    console.log(response4);
                    rest(response3.human.id)
                });
            });
        }
    });
});
