const formatDataPageCount = (data: string) : {} => {
    const returnData: {[key: string]: any} = {analysis: data};

    if (data.includes("Page count detected in document:")) {
        const startIndex: number = data.indexOf("document:");
        const endIndex: number = data.indexOf("Comparison:");

        if (startIndex && endIndex) {
            let text: string = "";
            let pageCount: {[chapter: string]: number} = {};
            let chapterPageCount: string[] = [];

            for (let i = startIndex + 9; i < endIndex; i++) {
                text += data[i];
            }
            text = text.replace(/\r?\n|\r/, "").trim();

            chapterPageCount = text.split("\n");

            for (let i = 0; i < chapterPageCount.length; i++) {
                chapterPageCount[i] = chapterPageCount[i].replace(/\r?\n|\r/, "").trim();
            }

            chapterPageCount.forEach((chapter, index) => {
                if (chapter) {
                    const splitText: string = chapter.replace(/\r?\n|\r/, "").trim();
                    pageCount[splitText.split(":")[0]] = parseInt(splitText.split(":")[1])
                }
            });

            returnData.page_count = pageCount;
        }
    }

    if (data.includes("Comparison:")) {
        const startIndex: number = data.indexOf("parison:");
        const endIndex: number = data.indexOf("Percentage:");

        if (startIndex && endIndex) {
            let text: string = "";
            let enoughCount: {[chapter: string]: boolean} = {};
            let chapterPageCount: string[] = [];

            for (let i = startIndex + 9; i < endIndex; i++) {
                text += data[i];
            }
            text = text.replace(/\r?\n|\r/, "").trim();

            chapterPageCount = text.split("\n");

            for (let i = 0; i < chapterPageCount.length; i++) {
                chapterPageCount[i] = chapterPageCount[i].replace(/\r?\n|\r/, "").trim();
            }

            chapterPageCount.forEach((chapter, index) => {
                if (chapter) {
                    const splitText: string = chapter.replace(/\r?\n|\r/, "").trim();

                    const chapterTitle: string = splitText.split(":")[0];
                    const isEnough: boolean = splitText.split(":")[1].trim() === "Not enough" ? false : true;

                    if (chapterTitle !== "Total page count") {
                        enoughCount[chapterTitle] = isEnough;
                    }
                }
            });

            returnData.enough_count = enoughCount;
        }
    }

    return returnData;
}

export default formatDataPageCount;