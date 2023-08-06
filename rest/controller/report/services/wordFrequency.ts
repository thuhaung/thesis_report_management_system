const formatDataWordFrequency = (data: string): {} => {
    if (data.includes("Keywords extracted from Abstract:")) {
        const startIndex: number = data.indexOf(":");
        const endIndex: number = data.indexOf("Keywords extracted from Abstract:");
        
        if (startIndex && endIndex) {
            let text: string = "";
            let mostCommonWords: string[] = [];

            for (let i = startIndex + 1; i < endIndex; i++) {
                text += data[i];
            }
            
            mostCommonWords = text.split(/\r?\n/);
            const filteredWords: string[] = mostCommonWords.filter(text => text.trim() !== "");
            const wordFrequency: {[key: string] : number} = {};

            filteredWords.forEach((word, index) => {
                const pair: string[] = word.split(":");
                pair[0] = pair[0].replace(/\(|\)|'/g, "");
                pair[1] = pair[1].replace(/\(|\)|'/g, "");
                
                wordFrequency[pair[0]] = parseInt(pair[1]);
            });

            if (data.includes("Overlapping keywords:")) {
                const startIndex: number = data.indexOf("Overlapping keywords:") + "Overlapping keywords:".length;
                const endIndex: number = data.length;

                let overlap: string = "";

                for (let i = startIndex + 1; i < endIndex; i++) {
                    overlap += data[i];
                }

                const overlappingWords: string[] = overlap.split(", ");
                
                return {word_frequency: wordFrequency, overlap: overlappingWords, analysis: data};
            }
            else {
                return {word_frequency: wordFrequency, analysis: data};
            }
        }
        else {
            return {analysis: data};
        }
    }
    return {analysis: data};
}

export default formatDataWordFrequency;