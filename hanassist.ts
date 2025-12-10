let convByVar;
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