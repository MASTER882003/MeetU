class IPCRenderer {

    static instance = null;

    constructor() {
        this.ipc = require('electron').ipcRenderer;
    }

    static GetInstance() {
        if(this.instance == null)
            IPCRenderer.instance = new IPCRenderer();
        
        return IPCRenderer.instance;
    }
}
