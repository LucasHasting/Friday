if(localStorage.getItem("username")){
    document.getElementById('login_button').innerHTML = "Account";
}

// Set the date we're counting down to be the next friday
const FRIDAY = 5;
const DAYS_IN_WEEK = 7;

let now = new Date();
const daysUntilFriday = (FRIDAY - now.getDay() + DAYS_IN_WEEK) % DAYS_IN_WEEK;

const friday = new Date(now);
friday.setDate(now.getDate() + daysUntilFriday);
friday.setHours(0, 0, 0, 0);

// Update the count down every 1 second
var x = setInterval(() => {
    // Get today's date and time
    now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = friday - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="Timer"
    document.getElementById("Timer").innerHTML = days + "d " + hours + "h "
    + minutes + "m " + seconds + "s ";

    // If the count down is finished, write FRIDAY
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("Timer").innerHTML = "IT IS FRIDAY!!!!";
    }
}, 1000);