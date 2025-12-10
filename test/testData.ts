import { getData, getValidLevels } from "../data";


getData().then(data => {
    console.log(JSON.stringify(data));
});

getValidLevels().then(data => {
    console.log(JSON.stringify(data));
});