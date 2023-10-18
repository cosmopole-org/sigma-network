
let { io } = require('socket.io-client')

let socket = io('http://localhost:3000')
const towerTest = () => {
    socket.emit('tower/create', { title: 'libbrary', isPublic: true }, (response7) => {
        console.log(response7);
        socket.emit('tower/update', { towerId: response7.tower.id, title: 'library', isPublic: true }, (response8) => {
            console.log(response8);
            socket.emit('tower/search', { query: 'lib' }, (response9) => {
                console.log(response9);
                socket.emit('tower/join', { towerId: response7.tower.id }, (response10) => {
                    console.log(response10);
                    socket.emit('tower/remove', { towerId: response7.tower.id }, (response11) => {
                        console.log(response11);
                    });
                });
            });
        });
    });
}
const rest = (humanId) => {
    socket.emit('human/readById', { targetHumanId: humanId }, (response5) => {
        console.log(response5);
        socket.emit('human/search', { query: 'edw' }, (response6) => {
            console.log(response6);
            towerTest()
        });
    });
}
socket.emit('human/signUp', { email: 'test@test.com' }, (response1) => {
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
