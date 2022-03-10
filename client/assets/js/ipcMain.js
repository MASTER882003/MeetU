const ipc = require('electron').ipcMain;
const { PathBuilder } = require('./pathBuilder');
const { Client, Packet } = require('./client');

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

    constructor(win) {
        this.win = win;
        //loadFile
        ipc.on("loadFile", (event, data) => {
            var fileContent = fs.readFileSync(PathBuilder.AppendToRoot(data.path));

            event.sender.send('loadfile-response', fileContent.toString());
        });
    }

}

module.exports = { IPCMain };