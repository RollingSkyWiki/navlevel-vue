import { getData, getValidLevels, fetchData, fetchDifficulty } from "../data";


fetchData().then(data => console.log(JSON.stringify(data)));

fetchDifficulty().then(data => console.log(JSON.stringify(data)));