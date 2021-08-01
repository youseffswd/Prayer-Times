function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    chrome.runtime.sendMessage({ latitude, longitude });
}
function error() {
    status.textContent = "Unable to retrieve your location";
}

if (!navigator.geolocation) {
    document.body.innerHTML = "Geolocation is not supported by your browser";
} else {
    navigator.geolocation.getCurrentPosition(success, error);
}
chrome.runtime.onMessage.addListener(arg => {
    const datatime = arg.data.results.datetime[0];
    const { times } = datatime;
    const prayersTimes = {
        Fajr: times.Imsak,
        Sunrise: times.Sunrise,
        Dhuhr: times.Dhuhr,
        Asr: times.Asr,
        Maghrib: times.Sunset,
        Isha: times.Isha,
    };
    setTimes(datatime);
    renderPrayers(prayersTimes);
    nextPrayersTimesInSeconds(prayersTimes);
    document.querySelector(".loader").classList.add("loaded");
});
function setTimes(datatime) {
    melady.textContent = datatime.date.gregorian;
    hegry.textContent = datatime.date.hijri;
}
function renderPrayers(prayersTimes) {
    const timesArr = Object.keys(prayersTimes);
    prayers.innerHTML = timesArr
        .map(item => {
            return `<div class="item" id=${item}>
            <h3>${item}</h3>
            <h2></h2>
            <p>${prayersTimes[item]}</p>
        
        </div>`;
        })
        .join("");
}
let nextPrayerEle, nextPrayerH2, timer;
const prayersTimesInSeconds = {};
function nextPrayersTimesInSeconds(prayersTimes) {
    for (const key in prayersTimes) {
        prayersTimesInSeconds[key] = getSeconds(prayersTimes[key]);
    }
    getTheNextPrayer();
}
function getTheNextPrayer() {
    const currentTime = getSeconds("0" + new Date().toLocaleTimeString());
    const prayersValues = Object.values(prayersTimesInSeconds);
    let nextPrayer = prayersValues
        .sort((a, b) => a - b)
        .find(item => item > currentTime);
    let theDifference = nextPrayer - currentTime;
    if (!nextPrayer) {
        nextPrayer = Math.min(...prayersValues);
        theDifference = currentTime - nextPrayer;
    }
    console.log(nextPrayer, prayersTimesInSeconds, prayersValues);
    const nextPrayerName = Object.keys(prayersTimesInSeconds).find(
        item => prayersTimesInSeconds[item] === nextPrayer
    );
    nextPrayerEle = document.getElementById(nextPrayerName);
    nextPrayerEle.classList.add("active");
    nextPrayerH2 = nextPrayerEle.querySelector("h2");
    nextPrayerH2.textContent = getTime(theDifference).slice(0, 8);
    timer = setInterval(() => countDown(nextPrayer), 1000);
}
function countDown(nextPrayer) {
    const currentTime = getSeconds("0" + new Date().toLocaleTimeString());
    const theDifference =
        currentTime > nextPrayer
            ? currentTime - nextPrayer
            : nextPrayer - currentTime;
    if (theDifference == 0) {
        nextPrayerH2.textContent = "00:00:00";
        clearInterval(timer);
        setTimeout(() => {
            nextPrayerEle.classList.remove("active");
            getTheNextPrayer();
        }, 5000);
        return;
    }
    nextPrayerH2.textContent = getTime(theDifference).slice(0, 8);
}
function getSeconds(time) {
    let hours = parseInt(time.slice(0, 2));
    const minutes = parseInt(time.slice(3, 5));
    const seconds = time.length >= 10 ? parseInt(time.slice(6, 8)) : 0;
    hours = time.toLowerCase().includes("am") && hours === 12 ? 0 : hours;
    hours =
        time.toLowerCase().includes("pm") && hours !== 12 ? hours + 12 : hours;
    console.log(hours);
    return hours * 60 * 60 + minutes * 60 + seconds;
}
function getTime(timeInSeconds) {
    let hours = Math.floor(timeInSeconds / 60 / 60);
    const minutes = Math.floor((timeInSeconds - hours * 60 * 60) / 60);
    const seconds = timeInSeconds - hours * 60 * 60 - minutes * 60;
    let dayOrNight = hours > 12 ? "PM" : "AM";
    hours = hours > 12 ? hours - 12 : hours;

    return `${hours > 9 ? hours : "0" + hours}:${
        minutes > 9 ? minutes : "0" + minutes
    }:${seconds > 9 ? seconds : "0" + seconds}   ${dayOrNight}`;
}
