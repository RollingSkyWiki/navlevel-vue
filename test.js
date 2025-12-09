// data.ts
var KEY = "rswiki:NavLevel-data";
var LEVEL_KEY = "rswiki:NavLevel-levels";
var EXPIRY_KEY = "rswiki:NavLevel-expiry";
var REJECT_THRESHOLD = 210;
var EXPIRY_SECS = 3600 * 12;
var EXPIRY_MS = EXPIRY_SECS * 1000;
var ORIGIN = "https://rs.miraheze.org/";
async function fetchData() {
  const res = await new mw.Api().get({
    action: "cargoquery",
    formatversion: 2,
    tables: "Level",
    fields: "Level.name_zh = name, Level.num = num, Level._pageName = page, Level.type = type, Level.stars = stars",
    where: "Level.type = '官方' or Level.type = '共创'",
    limit: 500
  });
  if (!res.cargoquery) {
    return null;
  }
  const data = res.cargoquery.map((item) => {
    return {
      ...item.title,
      num: Number(item.title.num)
    };
  });
  if (data.length < REJECT_THRESHOLD) {
    return null;
  }
  return data;
}
async function getData() {
  const dataJson = localStorage.getItem(KEY);
  let data;
  try {
    if (!dataJson) {
      throw new Error("No data");
    }
    data = JSON.parse(dataJson);
  } catch (e) {}
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (expiry && Number(expiry) && Number(expiry) < Date.now()) {
    console.log("Expired, fetching new data");
    const newData = await fetchData();
    if (newData) {
      localStorage.setItem(KEY, JSON.stringify(newData));
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + EXPIRY_MS));
      return newData;
    } else {
      return data;
    }
  }
  if (!data) {
    data = await fetchData();
    if (data) {
      localStorage.setItem(KEY, JSON.stringify(data));
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + EXPIRY_MS));
    }
    return data;
  }
  return data;
}
async function getValidLevels() {
  let levels = mw.storage.getObject(LEVEL_KEY);
  if (levels) {
    return levels;
  }
  const res = await fetch(ORIGIN + "wiki/Module:NavLevel/levels?action=raw");
  if (!res.ok) {
    return null;
  }
  const text = await res.text();
  const intoJSON = text.replace(/^return\s+/, "").replace(/\{/g, "[").replace(/\}/g, "]").replace(/\-\-.*?\n/g, "");
  try {
    levels = JSON.parse(intoJSON);
  } catch (e) {
    return null;
  }
  mw.storage.setObject(LEVEL_KEY, levels, EXPIRY_SECS);
  return levels;
}

// testData.ts
getData().then((data) => {
  console.log(data);
});
getValidLevels().then((data) => {
  console.log(data);
});
