$(function() {
    $("#btn-login").on("click", () => {
        FileLoader.LoadFile("/pages/login/login.html");
    });

    $("#btn-register").on("click", () => {
        FileLoader.LoadFile("/pages/login/login.html", () => {
            $("#signUp").trigger("click");
        });
    })
});