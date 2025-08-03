const fs = require("fs");

const rawData = fs.readFileSync("data/records.json", "utf-8");
const data = JSON.parse(rawData);

const levels = data.map(user => user.level).sort((a, b) => b - a);
const total = levels.length;

function getPercentileLevel(pct) {
    const index = Math.ceil((pct / 100) * total) - 1;
    return levels[index] || 0;
}

const rankings = {
    top1: getPercentileLevel(1),
    top5: getPercentileLevel(5),
    top10: getPercentileLevel(10),
    top20: getPercentileLevel(20),
    top50: getPercentileLevel(50)
};

fs.writeFileSync("data/rankings.json", JSON.stringify(rankings, null, 2));

console.log("rankings.json 생성 완료");
