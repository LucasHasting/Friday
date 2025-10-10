const localStorage = window.localStorage;

//HIDE EVERYTHING
document.getElementById('hide').classList.add('hidden');

//ACCOUNT
if((localStorage.getItem("username")) && (window.location.href.indexOf("/account") === -1)){
    window.location.href = "/account";
} else if ((localStorage.getItem("username")) && window.location.href.indexOf("/account") != -1) {
    document.getElementById('Message').innerHTML += " " + localStorage.getItem("username") + "!";
    
    //UN-HIDE EVERYTHING
    document.getElementById('hide').classList.remove('hidden');

//LOGIN
} else if (window.location.href.indexOf("/login") === -1){
    window.location.href = "/login";
} else if (!(localStorage.getItem("username")) && window.location.href.indexOf("/login") != -1) {
    //UN-HIDE EVERYTHING
    document.getElementById('hide').classList.remove('hidden');
}