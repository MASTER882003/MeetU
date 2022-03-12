class WindowManager {

    static windows = [];

    static Open(callback = () => {}) {
        FileLoader.LoadFile("/pages/main/main.html", () => {
            this.windows.forEach(win => {
                if(win.isOpen) {
                    win.show();
                }
            });

            callback();
        });
    }

}