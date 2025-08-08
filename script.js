Kakao.init("f542d96e283a54f650bfdaa9ff56263a");
console.log(Kakao.isInitialized());


//모바일일 경우 → true 반환
function isMobileDevice() {
    const ua = navigator.userAgent;
    return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}


let level = 1;

// 성공확률
function getSuccessRate(level) {
    if (level === 1)
        return 0.99;
    return Math.max(1 - level * 0.03, 0.03);
}

const dTest = new Date();
console.log(dTest);
dTest.setTime(dTest.getTime() + (365 * 24 * 60 * 60 * 1000))
console.log(dTest);
const expiresTest = "expires=" + dTest.toUTCString();
console.log(expiresTest);
console.log(document.cookie);
//
// const value = "; " + document.cookie;
// let name = '바나나'
// let str = "바나나=노랑; 사과=빨강; 수박=초록"
// console.log(str);

//쿠키 저장
function setCookie(name, value, days = 1) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000)); //유효기간 1일으로 세팅
    const expires = "expires=" + d.toUTCString(); // 
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

//쿠키 가져오기
function getCookie(name) {
    const value = "; " + document.cookie; // "; gameOver=true; username=minjun; score=100"
    const parts = value.split("; " + name + "=");
    //  [
    //   "; gameOver=true",      // 앞부분
    //   "minjun; score=100"     // username 뒤에 나오는 부분 (우리가 원하는 것)
    //  ]
    if (parts.length === 2)
        return parts.pop().split(";").shift();
    //pop : 배열 마지막 요소 꺼내기 -> "minjun; score=100"
    //split -> minjun; score=100" -> ["minjun", " score=100"]
    //shift : 배열 첫번째 요소 꺼내기 -> "minjun"
    return null;
}

const rankingTable = [
    { level: 20, percentile: 4 },
    { level: 15, percentile: 11 },
    { level: 10, percentile: 23 },
    { level: 5, percentile: 50 },
    { level: 0, percentile: 100 },
];

function getMyPercentile(level) {
    for (const rank of rankingTable) {
        if (level >= rank.level)
            return rank.percentile;
    }
    return 100;
}


const levelText = document.getElementById("levelText");
const btn = document.getElementById("challengeBtn");
const resultMsg = document.getElementById("resultMsg");
const myRank = document.getElementById("myRank");
const bestInfo = document.getElementById("bestInfo");
const shareBtn = document.getElementById("shareBtn");

btn.addEventListener("click", () => {
    const successRate = getSuccessRate(level); //성공확률
    const rand = Math.random(); //0~1 난수생성

    if (rand < successRate) {
        // 성공 시
        level++;
        const newRate = Math.round(getSuccessRate(level) * 100); //다음단계 확률
        levelText.textContent = `Lv.${level} 현재 확률: ${newRate}%`;
    } else {
        // 실패 시
        localStorage.setItem("gameOver", "true");//쿠키 저장
        localStorage.setItem("lastLevel", level);

        //최고기록 저장
        const prevBest = parseInt(localStorage.getItem("bestLevel")) || 0;
        if (level > prevBest) {
            localStorage.setItem("bestLevel", level); //최고 기록을 현재 점수로 덮어씌움
        }


        btn.disabled = true;
        btn.textContent = "실패 😵";
        resultMsg.style.display = "block";
        resultMsg.textContent = `Game Over! 당신의 최고 레벨은 Lv.${level}입니다`;
        const percentile = getMyPercentile(level);
        bestInfo.textContent = `지금까지의 최고 기록: Lv.${Math.max(level, prevBest)}`;
        myRank.textContent = `나는 상위 ${percentile}%입니다`;
    }

});


//페이지 로드시 쿠키 확인
window.addEventListener("DOMContentLoaded", () => {
    //HTML 문서의 DOM이 모두 로드되었을 때

    //pc로 접속하면 qr코드 보여주는 기능
    const isMobile = isMobileDevice();
    const gameContainer = document.querySelector(".container");
    const mobileOnlyNotice = document.getElementById("mobileOnlyNotice");

    if (!isMobile) {
        // PC 접속하면
        gameContainer.style.display = "none"; // 기본 컨테이너 숨김
        mobileOnlyNotice.style.display = "block"; // qr코드 컨테이너 보여줌

        const canvas = document.getElementById("mobileQrCode");
        QRCode.toCanvas(canvas, window.location.href, {
            width: 200,             // 크기 (픽셀)
            margin: 2,              // 여백 (모듈 수 기준, 기본값 4)
        }, function (error) {
            if (error) console.error("QR 코드 생성 실패:", error);
            else console.log("QR 코드 생성 완료!");
        });
        return;
    }


    // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    // ↓↓↓ 모바일일 때만 아래 게임 로직 실행 ↓↓↓
    // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    const isGameOver = localStorage.getItem("gameOver"); //null 이거나 "true"
    const lastLevel = parseInt(localStorage.getItem("lastLevel")); //레밸 배열값 정수로
    const retryAvailable = localStorage.getItem("retryAvailable");
    const bestLevel = parseInt(localStorage.getItem("bestLevel")) || 1;
    if (retryAvailable === "true") {
        btn.disabled = false; //버튼 활성화
        btn.textContent = "도전하기"
        bestInfo.textContent = `지금까지의 최고 기록: Lv.${localStorage.getItem("bestLevel")}`;
        resultMsg.style.display = "none";

    }

    if (isGameOver === "true") {
        if (!isNaN(lastLevel)) {
            btn.disabled = true; //버튼 비활성화
            btn.textContent = "재도전 불가 😵";
            resultMsg.style.display = "block";
            resultMsg.textContent = `Game Over! 당신의 최고 레벨은 Lv.${lastLevel} 입니다`;
            const percentile = getMyPercentile(lastLevel);
            myRank.textContent = `나는 상위 ${percentile}% 입니다`;
        }
    }
});
// 공유 버튼 클릭 시 재도전 허용
shareBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!navigator.share) {
        alert("이 브라우저에서는 공유 기능이 지원되지 않습니다.");
        return;
    }

    const bestLevel = parseInt(localStorage.getItem("bestLevel"))
    const shareData = {
        title: "럭키 버튼 도전!",
        text: `나는 Lv.${bestLevel}까지 갔다! 😎 너도 도전해봐!`,
        url: window.location.href,
    };

    try {
        await navigator.share(shareData);
        console.log("공유 성공!");

        // 공유 성공한 걸로 간주하고 재도전 기회 부여
        localStorage.setItem('retryAvailable', 'true', 1);
        localStorage.removeItem('gameOver', '', -1);
        localStorage.removeItem('lastLevel', '', -1);
        alert("공유 완료! 재도전 기회가 복구되었습니다.");
        location.reload();

    } catch (err) {
        console.error("공유 실패 또는 취소됨", err);
        alert("공유를 완료해야 재도전할 수 있어요!");
    }
});

// 랭킹 통계 JSON 불러오기
fetch('data/rankings.json')
    .then(res => res.json())
    .then(data => {
        const rankingList = document.getElementById('rankingList');
        rankingList.innerHTML = `
            <li>상위 1%는 ${data.top1} 스테이지에서 사망했습니다.</li>
            <li>상위 5%는 ${data.top5} 스테이지에서 사망했습니다.</li>
            <li>상위 10%는 ${data.top10} 스테이지에서 사망했습니다.</li>
            <li>상위 20%는 ${data.top20} 스테이지에서 사망했습니다.</li>
            <li>상위 50%는 ${data.top50} 스테이지에서 사망했습니다.</li>
            `;
    })
    .catch(error => {
        console.error("랭킹 데이터를 불러오지 못했습니다:", error);
    });

// 현재 시간 기준으로 records 버전 선택
const hour = new Date().getHours(); // 0~23
const version = Math.floor(hour / 8); // 0~2
const filePath = `data/records_${version}.json`;

fetch(filePath)
    .then(res => res.json())
    .then(data => {
        console.log(`[시간 ${hour}시] ${filePath} 로딩 완료`, data);

        // 여기에 calculateRanking 로직 직접 넣거나,
        // 백엔드 없이 그냥 보여주기용으로 써도 됨
    })
    .catch(err => console.error("불러오기 실패", err));