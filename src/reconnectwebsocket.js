/*
 * It provides a abstraction layer over native javascript Websocket.
 *
 * Provide additional functionality like if connection is close, open
 * it again and process the buffered requests
 */

var ReconnectSocket = (function () {
    'use strict';

    var socket,
        socketUrl = "",
        bufferedSends = [];

    var status = function () {
        return socket && socket.readyState;
    };

    var isReady = function () {
        return socket && socket.readyState === 1;
    };

    var isClose = function () {
        return !socket || socket.readyState === 3;
    };

    var sendBufferedSends = function () {
        while (bufferedSends.length > 0) {
            socket.send(JSON.stringify(bufferedSends.shift()));
        }
    };

    var init = function () {

        if(isClose()){
            socket = new WebSocket(socketUrl);
        }

        socket.onopen = function (){
            sendBufferedSends();
        };

        socket.onmessage = function (msg){
            console.log(msg);
        };

        socket.onclose = function (e) {
            console.log("socket closed", e);
        };

        socket.onerror = function (error) {
            console.log('socket error', error);
        };
    };

    var send = function(data) {
        if (isClose()) {
            bufferedSends.push(data);
            init();
        } else if (isReady()) {
            socket.send(JSON.stringify(data));
        } else {
            bufferedSends.push(data);
        }
    };

    var close = function () {
        bufferedSends = [];
        if (socket) {
            socket.close();
        }
    };

    var clear = function(){
        bufferedSends = [];
        manualClosed = false;
    };

    return {
        init: init,
        send: send,
        close: close,
        socket: socket,
        clear: clear
    };

})();
