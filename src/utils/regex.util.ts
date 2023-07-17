export const regexFind = (text: string, regex: RegExp) => {
    const match = text.match(regex);
    if (match && match[1]) {
        return match[1].trim();
    }

    return text;
}