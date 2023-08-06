export const getName = (id) => {
    const split = id.split("_");

    split[0] = split[0].charAt(0).toUpperCase() + split[0].substring(1);     

    return split.join(" ");
}

const getServices = () => {
    const services = process.env.REACT_APP_SERVICE_LIST.split(",");
    const analytical = ["word_frequency", "chapter_summarization"];
    const finalServiceList = [];

    for (let i = 0; i < services.length; i++) {
        const service = {
            id: services[i],
            name: getName(services[i]),
            type: analytical.includes(services[i]) ? "analytical" : "template-based"
        }

        finalServiceList.push(service);
    }

    return finalServiceList;
}

export default getServices;