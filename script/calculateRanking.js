// 랭킹은 사용 안하지만 구현해놔서 남겨둠
const fs = require("fs");

const allData = [];

// records_0.json ~ records_2.json 읽어서 합치기
for (let i = 0; i < 3; i++) {
    const filePath = `data/records_${i}.json`;
    if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath, "utf-8");
        allData.push(...JSON.parse(rawData));
    }
}

const levels = allData.map(user => user.level).sort((a, b) => b - a);
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
