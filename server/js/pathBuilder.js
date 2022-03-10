import { rootPath } from 'electron-root-path';

export class PathBuilder {
    static AppendToRoot(path) {
        path = path.replace("/", "\\");
        return rootPath + path;
    }
}