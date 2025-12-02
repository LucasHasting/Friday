//constants
const FRIDAY = 5;
const DAYS_IN_WEEK = 7;

//check if username, then all account menu
if(localStorage.getItem("username")){
    document.getElementById('login_button').innerHTML = "Account";
}

async function loadData() {
    // Set the date we're counting down to be the next friday
    let now = new Date();
    const daysUntilFriday = (FRIDAY - now.getDay() + DAYS_IN_WEEK) % DAYS_IN_WEEK;

    const friday = new Date(now);
    friday.setDate(now.getDate() + daysUntilFriday);
    friday.setHours(0, 0, 0, 0);

    // Update the count down every 1 second
    var x = setInterval(async function () {
        // Get date from route
        let serverNow = null;

        try {
            const response = await fetch('/friday/time', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            serverNow = data.time;
        } catch (error) {
        serverNow = null;
        }
        if (serverNow === null) return;

        // Find the distance between now and the count down date
        let distance = friday.getTime() - serverNow;

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
    }, 1000)
};

//wait for the time
(async function() {
    await loadData();
})();