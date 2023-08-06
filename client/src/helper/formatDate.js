const formatDate = (dateString) => {
    const date = new Date(dateString);

    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;
    min = min < 10 ? "0" + min : min;
    const time = hour + ":" + min + ampm;

    const str = time + " " + day + "/" + month + "/" + date.getFullYear();

    return str;
}

export default formatDate;