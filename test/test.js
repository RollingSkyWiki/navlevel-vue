// data.ts
var REJECT_THRESHOLD = 210;
var EXPIRY_SECS = 3600 * 12;
var EXPIRY_MS = EXPIRY_SECS * 1000;
var ORIGIN = "https://rs.miraheze.org/";
var REL_SEP = "、";
async function fetchData() {
  const res = await new mw.Api().get({
    action: "cargoquery",
    formatversion: 2,
    tables: "Level, Version",
    fields: "Level.name_zh = name, Level.num = num, Level._pageName = page, Level.type = type, Level.stars = stars, Level.first_came_version = inVer, Level.removed_version = remVer, Level.restored_version = resVer, Level.award = award, Level.diamonds = dia, Level.related_level = rel, Version.date = inDate",
    where: "Level.stars IS NOT NULL AND(Level.type = '官方' OR Level.type = '共创') AND Level._pageName NOT LIKE '%（旧）'",
    join_on: "Level.first_came_version = Version._pageName",
    limit: 500
  });
  if (!res.cargoquery) {
    return null;
  }
  const data = res.cargoquery.map((item) => {
    return {
      num: Number(item.title.num),
      stars: Number(item.title.stars),
      inVer: item.title.inVer,
      remVer: item.title.remVer,
      resVer: item.title.resVer,
      inDate: item.title.inDate,
      type: item.title.type,
      page: item.title.page,
      name: item.title.name,
      award: item.title.award,
      dia: Number(item.title.dia),
      rel: item.title.rel && item.title.rel !== "" ? item.title.rel.split(REL_SEP) : []
    };
  });
  if (data.length < REJECT_THRESHOLD) {
    return null;
  }
  return data;
}
async function fetchDifficulty() {
  const res = await fetch(ORIGIN + "wiki/Module:Difficulty/data.json?action=raw");
  if (!res.ok) {
    return null;
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

// test/testData.ts
fetchData().then((data) => console.log(JSON.stringify(data)));
fetchDifficulty().then((data) => console.log(JSON.stringify(data)));
