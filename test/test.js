// data.ts
var REJECT_THRESHOLD = 210;
var EXPIRY_SECS = 3600 * 12;
var EXPIRY_MS = EXPIRY_SECS * 1000;
async function fetchData() {
  const res = await new mw.Api().get({
    action: "cargoquery",
    formatversion: 2,
    tables: "Level",
    fields: "Level.name_zh = name, Level.num = num, Level._pageName = page, Level.type = type, Level.stars = stars, Level.first_came_version = inVer, Level.removed_version = remVer, Level.restored_version = resVer",
    where: "Level.stars IS NOT NULL AND(Level.type = '官方' OR Level.type = '共创') AND Level._pageName NOT LIKE '%（旧）'",
    limit: 500
  });
  if (!res.cargoquery) {
    return null;
  }
  const data = res.cargoquery.map((item) => {
    return {
      ...item.title,
      num: Number(item.title.num),
      stars: Number(item.title.stars)
    };
  });
  if (data.length < REJECT_THRESHOLD) {
    return null;
  }
  return data;
}

// test/testData.ts
fetchData();
