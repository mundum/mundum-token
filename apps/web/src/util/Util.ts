export const getLanguage = () => {
    const lang = navigator.language;
    if (lang === "en-US") {
        return "en";
    }
    return "de";
};

