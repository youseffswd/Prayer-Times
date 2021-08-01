chrome.runtime.onMessage.addListener(async ({ longitude, latitude }) => {
    const url = new URL("https://api.pray.zone/v2/times/day.json");
    const params = {
        longitude,
        latitude,
        elevation: 333,
        date: new Date().toLocaleDateString(),
        timeformat: 1,
        school: 5,
    };

    url.search = new URLSearchParams(params).toString();

    const res = await fetch(url);
    const data = await res.json();
    chrome.runtime.sendMessage({ data });
});
