class ChatManager {

    static chats = new Map();

    static Initialized = false;

    static WaitForInit(callback) {
        var func = () => {
            if(ChatManager.Initialized) callback();
            else setTimeout(func, 500);
        }

        func();
    }

    static HandlePacket(packet) {
        var chatID = packet.read("chatID");
        if(chatID == undefined) {
            return;
        }

        var chat = this.GetChat(chatID);
        if(chat) chat.handle(packet);
    }

    static UserChange() {
        this.Initialized = false;
        ChatManager.chats = new Map();

        var packet = new Packet(Packet.ClientPackets.chat);
        packet.write("action", "requestChats");
        packet.onResponse = (resPacket) => {
            resPacket.read("chats").forEach(chat => {
                ChatManager.chats.set(chat.id, new Chat(chat.id, chat.name, chat.messages, chat.participants));
            });
            ChatManager.Initialized = true;
        }

        Client.GetInstance().sendTcpData(packet);
    }

    static Open() {
        ChatManager.WaitForInit(() => {
            FileLoader.LoadFile("/pages/chat/chat.html", () => {
                //per default select global chat
                ChatManager.OpenChat(ChatManager.chats[0]);

                //init eventhandlers
                $("#chat-input").on("keydown", (e) => {
                    if(e.keyCode === 13) {
                        console.log("Enter pressed");
                    }
                })
            });
        });
    }

    static GetChat(id) {
        return ChatManager.chats.get(id);
    }
}

class ChatWindow {

    constructor() {
        this.window = new Window("MyChat");

        this.window.setMinSize(300, 500);

        this.window.setSize(600, 500);

        this.activeChat = null;
    }

    getMessageTemplate() {
        var messageTemplate = document.createElement("div");
        $(messageTemplate).addClass("message");
        var content = document.createElement("div");
        $(content).addClass("message-content");
        var userTemplate = document.createElement("div");
        $(userTemplate).addClass("message-user");
        var pfp = document.createElement("img");
        $(pfp).addClass("pfp").attr("src", "http://localhost:8080/pfp?path=defaultImages/sharky.jpg");
        var username = document.createElement("div");
        $(username).addClass("username").text("{ username }");

        userTemplate.appendChild(pfp);
        userTemplate.appendChild(username);

        messageTemplate.appendChild(content);
        messageTemplate.appendChild(userTemplate);

        return messageTemplate;
    }

    openChat(chat) {
        if(chat == undefined) {
            this.window.setTitle("Chat window")
            this.window.setContent("<h1>Chat not found</h1>");
            return;
        }

        if(this.activeChat) {
            this.activeChat.unSubscribe("onmessage");
        }

        this.activeChat = chat;

        this.window.loadFile("/pages/chat/chat.html", () => {    
            this.activeChat.messages.forEach(message => {
                this.printMessage(message);
            });

            console.log(this.activeChat);
    
            this.window.setTitle(this.activeChat.name);
            
            //sending message
            $(this.window.getContent()).find(".chat-input").on("keyup", (event) => {
                if(event.keyCode === 13) {
                    var message = $(this.window.getContent()).find(".chat-input").val();
                    if(message != ""){
                        $(this.window.getContent()).find(".chat-input").val("");
                        this.activeChat.sendMessage(message)
                    }
                }
            });
        });

        //incoming message
        this.activeChat.subscribe("onmessage", (message) => {
            this.printMessage(message);
        });

    }

    printMessage(message) {
        var msgHTML = this.getMessageTemplate();
        if(message.user.id == Client.GetInstance().user.id) {
            $(msgHTML).addClass("own");
        }
        else {
            $(msgHTML).addClass("other");
        }
        $(msgHTML).find(".message-content").text(message.content);
        $(msgHTML).find(".message-user .pfp").attr("src", FileLoader.CreateImagePath(message.user.img));
        $(msgHTML).find(".message-user .username").text(message.user.username);
        $(this.window.getNode()).find(".messages").append(msgHTML);
    }

}

class Chat {
    constructor(id, name, messages, participants) {
        this.eventHandlers = [];
        this.id = id;
        this.name = name;
        this.messages = messages;
        this.participants = participants;
    }

    handle(packet) {
        var action = packet.read("action");

        switch(action) {
            case "message": this.addMessage(packet.read("message")); break;
        }
    }

    triggerEvent(name, data) {
        this.eventHandlers.forEach(eventHandler => {
            if(eventHandler.name == name) {
                eventHandler.handler(data);
            }
        });
    }

    addMessage(msg) {
        this.messages.push(msg);

        this.triggerEvent("onmessage", msg);
    }

    unSubscribe(event, handler) {
        this.eventHandlers = this.eventHandlers.filter(eventHandler => eventHandler.event == event && eventHandler.handler == handler);
    }

    subscribe(event, handler) {
        this.eventHandlers.push({
            name: event,
            handler: handler
        });
    }

    sendMessage(message) {
        var messagePacket = new Packet(Packet.ClientPackets.chat);
        messagePacket.write("action", "message");
        messagePacket.write("chatID", this.id);
        messagePacket.write("message", message);

        Client.GetInstance().sendTcpData(messagePacket);
    }
}