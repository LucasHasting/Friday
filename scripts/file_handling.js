const localStorage = window.localStorage;

//ACCOUNT
if((localStorage.getItem("username")) && (window.location.href.indexOf("/account") === -1)){
    window.location.href = "/account";
} else if ((localStorage.getItem("username")) && window.location.href.indexOf("/account") != -1) {
    document.getElementById('Message').innerHTML += " " + localStorage.getItem("username") + "!";

//LOGIN
} else if (window.location.href.indexOf("/login") === -1){
    window.location.href = "/login";
}