
class FileLoader {

    static LoadFile(path, callback = () => {}) {
        IPCRenderer.GetInstance().ipc.once('loadfile-response', (event, response) => {
            $("#site-content").html(response);
            callback();
        });

        IPCRenderer.GetInstance().ipc.send('loadFile', { path: path });
    }

}