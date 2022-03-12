class Window {

    constructor(title, icon = "./assets/images/logo.png") {
        this.title = title;
        this.icon = icon;
        this.id = require('shortid').generate();
        this.isOpen = false;

        this.minHeight = 150;
        this.minWidth = 150;

        this.beforeDisplay = () => {};
        this.afterDisplay = () => {};
        this.onMinimize = () => {};
        this.onClose = () => {};
        this.onShow = () => {};
        this.beforeContentChange = () => {};
        this.afterContentChange = () => {};

        //toolbar item
        this.toolbarHTML = document.createElement("div");
        $(this.toolbarHTML).addClass("window-minimalized window-open");
        var iconElement = document.createElement("img");
        $(iconElement).attr("src", this.icon).addClass("minimized-icon");

        var titleElement = document.createElement("span");
        $(titleElement).text(this.title);

        this.toolbarHTML.appendChild(iconElement);
        this.toolbarHTML.appendChild(titleElement);

        document.getElementById("window-toolbar").appendChild(this.toolbarHTML);

        //click on toolbar item
        $(this.toolbarHTML).on("click", (e) => {
            this.toolbarClick();
        });

        
        this.html = `<div class='window' id='${this.id}'>
                        <div class='window-head'>
                            <div class='window-information'>
                                <img src='${icon}' class='window-icon'>
                                <span class='window-title'>${title}</span>
                            </div>
                            <div class='window-tools'>
                                <div class='minimize-window'>
                                    <i class="fa-solid fa-window-minimize"></i>
                                </div>
                                <div class='close-window'> 
                                    <i class='fa-solid fa-xmark'></i>
                                </div>
                            </div>
                        </div>
                        <div class='window-body'>This is the content</div>
                    </div>`;

        $("#window-container").append(this.html);

        this.position = {
            x: this.getNode().getBoundingClientRect().left,
            y: this.getNode().getBoundingClientRect().top,
            z: 0
        }

        //dragging around
        $(this.getNode()).find(".window-head").on("mousedown", (downEvent) => {
            var offset = {
                x: this.getNode().offsetLeft - downEvent.clientX,
                y: this.getNode().offsetTop - downEvent.clientY
            }
            $(this.getNode()).find(".window-head").on("mousemove", (dragEvent) => {
                var newPosition = {
                    x: dragEvent.clientX + offset.x,
                    y: dragEvent.clientY + offset.y,
                    z: 0
                } 

                //no - numbers -> off screen
                if(newPosition.x < 0) newPosition.x = 0;
                if(newPosition.y < 0) newPosition.y = 0;

                this.moveTo(newPosition);
            });

        }).mouseup(() => {
            $(this.getNode()).find(".window-head").unbind('mousemove');
        }).mouseleave(() => {
            $(this.getNode()).find(".window-head").unbind('mousemove');
        });

        //minimize function
        $(this.getNode()).find(".minimize-window").on("click", (e) => {
            this.minimize();
        });

        //resize function
        $(this.getNode()).resizable({
            minHeight: this.minHeight,
            minWidth: this.minWidth
        });
    }

    setSize(height, width) {
        if(height <= this.minHeight || width <= this.minWidth) {
            return;
        }

        $(this.getNode()).css({
            width: width + "px",
            height: height + "px"
        });
    }

    moveTo(position) {
        this.position = position;

        $(this.getNode()).css({ "top": position.y + "px", "left": position.x + "px" });
    }

    getContent() {
        return $(this.getNode()).find(".window-body").get(0);
    }

    getNode() {
        return document.getElementById(this.id);
    }

    toolbarClick() {
        if(this.isOpen) {
            this.minimize();
        }
        else {
            this.show();
        }
    }

    setMinSize(height, width) {
        $(this.getNode()).resizable({
            minWidth: width,
            minHeight: height
        });

        var node = this.getNode();
        $(node).css({
            "min-height": height + "px",
            "min-width": width + "px"
        });
    }

    setTitle(title) {
        this.title = title;

        $(this.getNode()).find(".window-title").text(this.title);
    }

    loadFile(path, callback = () => {}) {
        IPCRenderer.GetInstance().ipc.once('loadfile-response', (event, response) => {
            this.setContent(response);
            callback();
        });

        IPCRenderer.GetInstance().ipc.send('loadFile', { path: path });
    }

    setContent(html) {
        this.beforeContentChange();

        $(this.getNode()).find(".window-body").html(html);

        this.afterContentChange();
    }

    //brings the window out of minimized mode
    show() {
        if(this.isOpen) {
            return;
        }

        this.isOpen = true;

        this.onShow();

        $(this.getNode()).removeClass("hide");
        $(this.toolbarHTML).addClass("window-open");
    }

    //minimizes the window
    minimize() {
        this.onMinimize();

        this.isOpen = false;
        $(this.getNode()).addClass("hide");
        $(this.toolbarHTML).removeClass("window-open");
    }
}