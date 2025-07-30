Kakao.init("f542d96e283a54f650bfdaa9ff56263a");
console.log(Kakao.isInitialized());

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
const value = "; " + document.cookie;
let name = '바나나'
let str = "바나나=노랑; 사과=빨강; 수박=초록"
console.log(str);

//쿠키 저장
function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000)); //유효기간 1년으로 세팅
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
        setCookie("gameOver", "true");//쿠키 저장
        setCookie("lastLevel", level);

        //최고기록 저장
        const prevBest = parseInt(getCookie("bestLevel")) || 0;
        if (level > prevBest) {
            setCookie("bestLevel", level); //최고 기록을 현재 점수로 덮어씌움
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
    const isGameOver = getCookie("gameOver"); //null 이거나 "true"
    const lastLevel = parseInt(getCookie("lastLevel")); //레밸 배열값 정수로
    const retryAvailable = getCookie("retryAvailable");
    const bestLevel = parseInt(getCookie("bestLevel")) || 1;
    if (retryAvailable === "true") {
        btn.disabled = false; //버튼 활성화
        btn.textContent = "도전하기"
        bestInfo.textContent = `지금까지의 최고 기록: Lv.${getCookie("bestLevel")}`;
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
shareBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("공유 시도함");
    Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
            title: '럭키 버튼 도전!',
            description: '나 몇 단계까지 갔게? 😎 너도 도전해봐!',
            imageUrl: 'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/home/bg_event_230703.png',
            link: {
                mobileWebUrl: window.location.href,
                webUrl: window.location.href,
            },
        },
        buttons: [
            {
                title: '나도 도전하기',
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href,
                },
            }
        ],
        success: () => {
            console.log('[카카오 공유 성공]');
            setCookie('retryAvailable', 'true', 1);
            setCookie('gameOver', '', -1);
            setCookie('lastLevel', '', -1);
            alert('공유 완료! 재도전 기회가 복구되었습니다.');
            location.reload();
        },
        fail: () => {
            alert('공유 실패 😢');
        },
    });
});