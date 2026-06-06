let convByVar: (locales: {hans: string, hant: string}) => string;
if (import.meta.env.DEV) {
    convByVar = ({hans, hant}) => {
        return location.search.includes("hant=1") ? hant : hans;
    }
} else {
    ({ convByVar } = require("ext.gadget.HanAssist"));
}
export {
    convByVar
}