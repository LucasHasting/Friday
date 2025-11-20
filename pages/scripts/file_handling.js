const localStorage = window.localStorage;

//Everything is hidden by default

//ACCOUNT
if((localStorage.getItem("username")) && (window.location.href.indexOf("/account") === -1)){
    window.location.href = "/account";
} else if ((localStorage.getItem("username")) && window.location.href.indexOf("/account") != -1) {
    //UN-HIDE EVERYTHING
    document.getElementById('hide').classList.remove('hidden');

//LOGIN
} else if (window.location.href.indexOf("/login") === -1){
    window.location.href = "/login";
} else if (!(localStorage.getItem("username")) && window.location.href.indexOf("/login") != -1) {
    //UN-HIDE EVERYTHING
    document.getElementById('hide').classList.remove('hidden');
}