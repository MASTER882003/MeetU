const ipc = require('electron').ipcMain;
const { PathBuilder } = require('./pathBuilder');
const { API } = require('./api');

const fs = require('fs');

class IPCMain {

    static instance = null;

    static Create() {
        if(this.instance == null){
            this.instance = new IPCMain();
        }

        return this.instance;
    }

    static GetInstance() {
        if(this.instance == null){
            this.instance = new IPCMain();
        }

        return this.instance;
    }

    constructor() {
        //loadFile
        ipc.on("loadFile", (event, data) => {
            var fileContent = fs.readFileSync(PathBuilder.AppendToRoot(data.path));

            event.sender.send('loadfile-response', fileContent.toString());
        });

        ipc.on("login", (event, data) => {
            API.Get("/login", { data }, (res) => {
                console.log(res);
            });
        });
    }

}

module.exports = { IPCMain };