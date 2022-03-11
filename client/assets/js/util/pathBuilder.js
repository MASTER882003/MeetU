const rootPath = require('electron-root-path').rootPath;

class PathBuilder {
    static AppendToRoot(path) {
        path = path.replace("/", "\\");
        return rootPath + path;
    }
}

module.exports = { PathBuilder };