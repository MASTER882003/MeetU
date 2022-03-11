class ChatManager {

    static chats = [];

    static Initialized = false;

    static WaitForInit(callback) {
        var func = () => {
            if(ChatManager.Initialized) callback();
            else setTimeout(func, 500);
        }

        func();
    }

    static UserChange() {
        this.Initialized = false;
        ChatManager.chats = [];

        var packet = new Packet(Packet.PacketTypes.requestChats);
        packet.onResponse = (resPacket) => {
            ChatManager.chats = resPacket.read("chats");
            this.Initialized = true;
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

    static OpenChat(chat) {
        var messageTemplate = ` <div class="message own">
                                <div class="message-content">
                                    { message }
                                </div>
                                <div class="message-user">
                                    <img class="pfp" src="http://localhost:8080/pfp?path=defaultImages/sharky.jpg">
                                    <div class="username">{ username }</div>
                                </div>
                            </div>`
        $("#messages").html("");

        chat.messages.forEach(message => {
            //TODO insert HTML
        });

        $("#chat-title").text(chat.name);

        //TODO participants etc.
    }

}