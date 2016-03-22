(function () {
    var config = {
        url: "",
        connections: "100",
        message: {key: "value"}, // message can be in json format or plain text, set isJson flag accordingly
        verbose: 0,
        isJson: 1
    };

    var connected = 1,
        output = {};

    var outputResult = function (id) {
        console.log("Received event for:", id, " Output is ", output[id]);
    };

    var onMessageCallback = function (id, msg) {
        output[id]['received'] = 1;
        var result;
        try {
          result = JSON.parse(msg.data);
        } catch (e) {
          result = msg.data;
        }
        if (config.verbose) {
          console.log(id, ": message is ", result);
        }
        outputResult(id);
    };

    var createSocket = function (id) {
        output[id] = {};
        output[id]['created'] = 1;

        var ws = new WebSocket(config.url);

        ws.onopen = function (e) {
            output[id]['open'] = 1;
            if (config.isJson) {
                ws.send(JSON.stringify(config.message));
            } else {
                ws.send(message);
            }
            connected++;
            console.log(id, ": Connected clients:", connected, " Total requested:", config.connections);
        };

        ws.onmessage = function (msg) {
            onMessageCallback(id, msg);
        };

        ws.onclose = function (e) {
            output[id]['closed'] = 1;
            if (config.verbose) {
                console.log(id, ": closed ", e);
            }
            outputResult(id);
        };

        ws.onerror = function (error) {
            output[id]['error'] = 1;
            if (config.verbose) {
                console.log(id, ": error is ", error);
            }
            outputResult(id);
        };
    };

    var randomKey = function () {
        return Math.random().toString(36).substring(2, 7) + (new Date()).getTime();
    };

    for (var i = 1; i <= config.connections; i++) {
        createSocket(randomKey());
    }
})();
