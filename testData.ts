import { getData, getValidLevels } from "./data";


getData().then(data => {
    console.log(data);
});

getValidLevels().then(data => {
    console.log(data);
});