import { getData, getValidLevels, fetchData } from "../data";


fetchData().then(data => console.log(JSON.stringify(data)));