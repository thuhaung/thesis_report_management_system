const formatDataChapterSummarization = (data: string) : {} => {
    const chapterRegex: RegExp = /(^|\n|\r|\r\n)(CHAPTER) (\d)+/g;
    const chapterTitles: RegExpMatchArray | null = data.match(chapterRegex);
    
    chapterTitles?.forEach((title, index) => {
        chapterTitles[index] = title.replace(/\r|\n|\r\n/g, "");
    });

    const chapterContent: string[] = [];
    const chapters: {[chapter_title: string] : string} = {};
    if (chapterTitles) {
        for (let i = 0; i < chapterTitles?.length; i++) {
            const start: string = chapterTitles[i];
            const startIndex: number = data.indexOf(start);

            let content: string = "";

            if (i !== chapterTitles.length - 1) {
                const end: string = chapterTitles[i + 1];
                const endIndex: number = data.indexOf(end);

                for (let j = startIndex; j < endIndex; j++) {
                    content += data[j];
                }
            }
            else {
                for (let j = startIndex; j < data.length; j++) {
                    content += data[j];
                }
            }

            chapterContent.push(content);
        }

        for (let i = 0; i < chapterContent.length; i++) {
            const chapterTitle = chapterTitles[i].charAt(0) + chapterTitles[i].slice(1).toLowerCase();
            chapters[chapterTitle] = chapterContent[i];
        }

        return chapters;
    }

    return {data};
}

export default formatDataChapterSummarization;