if(localStorage.getItem("username")){
    document.getElementById('login_button').innerHTML = localStorage.getItem("username");
}