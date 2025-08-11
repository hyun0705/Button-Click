Kakao.init("f542d96e283a54f650bfdaa9ff56263a");
console.log(Kakao.isInitialized());


//모바일일 경우 → true 반환
function isMobileDevice() {
    const ua = navigator.userAgent;
    return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

//뒷배경 별 생성
createStarField()

let level = 1;

// 성공확률
function getSuccessRate(level) {
    if (level === 1)
        return 0.99;
    return Math.max(1 - level * 0.03, 0.03);
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
        btnSound(true)
        createShockwave();
        createSuccessParticles();
        level++;
        const newRate = Math.round(getSuccessRate(level) * 100); //다음단계 확률
        levelText.textContent = `Lv.${level} 현재 확률: ${newRate}%`;
        let dots = 0;
        btn.disabled = true;

        btn.textContent = "대기중"
        const cooldownInterval = setInterval(() => {
            dots = (dots + 1) % 4; // 0~3 반복
            btn.textContent = "대기중" + ".".repeat(dots);
        }, 250); // 0.25초마다 업데이트

        setTimeout(() => {
            clearInterval(cooldownInterval);
            btn.disabled = false;
            btn.textContent = "도전하기";
        }, 1500); // 1.5초 쿨다운

    } else {
        // 실패 시
        shakeScreen();
        createButtonCollapse();
        createDigitalNoise();
        createScreenCracks();
        setTimeout(() => {
            createMassiveExplosion();
        }, 500); // 바로 실행하면 생성되는 위치가 잘못되서 약간 딜레이줌
        btnSound(false)


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
        resultMsg.innerHTML = `Game Over! 당신의 최고 레벨은 <span class="level-text">Lv.${level}</span>입니다`;
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
    const bestLevel = parseInt(localStorage.getItem("bestLevel")) || 1;
    if (isGameOver === "false") {
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
            resultMsg.innerHTML = `Game Over! 당신의 최고 레벨은 <span class="level-text">Lv.${lastLevel}</span> 입니다`;

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
        localStorage.removeItem('gameOver');
        localStorage.removeItem('lastLevel');
        alert("공유 완료! 재도전 기회가 복구되었습니다.");
        location.reload();

    } catch (err) {
        console.error("공유 실패 또는 취소됨", err);
        alert("공유를 완료해야 재도전할 수 있어요!");
    }
});

// 버튼 누를시 소리
function btnSound(isSuccess) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    //OscillatorNode(진동을 만들어서 소리를 발생시키는)를 생성.
    const gainNode = audioContext.createGain();
    //볼륨 조절 장치
    oscillator.connect(gainNode).connect(audioContext.destination);
    //oscillator → gainNode → audioContext.destination(스피커) 셋을 연결시킴

    if (isSuccess) {
        //성공하면
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        // 지금 시각(audioContext.currentTime)에 주파수를 200Hz로 설정
        oscillator.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.1);
        //지금부터 0.1초 뒤까지 지수적으로 1200Hz로 변하게 함.
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        //현재 볼륨을 0.5으로 설정 (1이 최대, 0이 무음).
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        //0.1초 동안 볼륨을 거의 0까지 부드럽게 줄임.
        oscillator.start(audioContext.currentTime);
        //지금 재생 시작
        oscillator.stop(audioContext.currentTime + 0.1);
        // 0.1초 뒤에 재생 종료 - 결과: 길이 0.1초짜리 짧은 효과음.
    }
    else {
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
}

//버튼 누를때 파동
const shockwave = document.querySelector('.shockwave');
function createShockwave() {

    shockwave.classList.remove('active');
    void shockwave.offsetWidth; // 리플로우 강제 발생
    shockwave.classList.add('active');

    setTimeout(() => {
        shockwave.classList.remove('active');
    }, 1000);
}

//성공시 파티클
const levelUpButton = document.getElementById("challengeBtn");
//파티클이 나올 기준이 되는 버튼
const particleContainer = document.getElementById("particleContainer");
//파티클을 담는 컨테이너

function createSuccessParticles() {
    const buttonRect = levelUpButton.getBoundingClientRect();
    const containerRect = particleContainer.getBoundingClientRect();
    //getBoundingClientRect : 화면(Viewport) 기준으로 요소의 위쪽·왼쪽 좌표, 너비, 높이를 반환

    const startX = buttonRect.left - containerRect.left + buttonRect.width / 2;
    const startY = buttonRect.top - containerRect.top + buttonRect.height / 2;
    //particle-container에서 버튼중앙까리 떨어진 거리

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle success';

        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        //css에 적용

        const angle = (Math.PI * 2 * i) / 20;
        const velocity = 40 + Math.random() * 35;

        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 20;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        particleContainer.appendChild(particle);


        particle.addEventListener('animationend', () => particle.remove(), { once: true });
        // 안전 제거 타임아웃
        setTimeout(() => particle.remove(), 1500);
    }
}
/* 화면 흔들림 효과 */
function shakeScreen() {
    document.body.animate([
        { transform: 'translate(0, 0) rotate(0deg)' },
        { transform: 'translate(-20px, 10px) rotate(-1deg)' },
        { transform: 'translate(20px, -10px) rotate(1deg)' },
        { transform: 'translate(-15px, 15px) rotate(-0.5deg)' },
        { transform: 'translate(15px, -15px) rotate(0.5deg)' },
        { transform: 'translate(-10px, 5px) rotate(-0.3deg)' },
        { transform: 'translate(10px, -5px) rotate(0.3deg)' },
        { transform: 'translate(0, 0) rotate(0deg)' }
    ], {
        duration: 500,
        easing: 'ease-out'
    });
}

/* 대규모 폭발 효과 */
function createMassiveExplosion() {
    const buttonRect = levelUpButton.getBoundingClientRect();
    const containerRect = particleContainer.getBoundingClientRect();
    // 컨테이너 기준 버튼 중심 좌표
    const centerX = buttonRect.left - containerRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top - containerRect.top + buttonRect.height / 2;

    /* 폭발 링 */
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const ring = document.createElement('div');
            ring.style.position = 'absolute';
            ring.style.left = centerX + 'px';
            ring.style.top = centerY + 'px';
            ring.style.width = '0';
            ring.style.height = '0';
            ring.style.border = '3px solid #ff0000';
            ring.style.borderRadius = '50%';
            ring.style.transform = 'translate(-50%, -50%)'; // 중심 정렬
            ring.style.pointerEvents = 'none';
            ring.style.zIndex = '1000';

            particleContainer.appendChild(ring);

            ring.animate(
                [
                    { width: '0', height: '0', opacity: 1, borderWidth: '3px' },
                    { width: '400px', height: '400px', opacity: 0, borderWidth: '1px' }
                ],
                { duration: 1000, easing: 'ease-out' }
            ).onfinish = () => ring.remove();
        }, i * 100);
    }

    /* 파편 */
    for (let i = 0; i < 100; i++) {
        const fragment = document.createElement('div');

        fragment.style.position = 'absolute';
        fragment.style.width = Math.random() * 15 + 5 + 'px';
        fragment.style.height = Math.random() * 15 + 5 + 'px';
        fragment.style.background = Math.random() > 0.5 ? '#ff0000' : '#ff6600'; // 빨강/주황 랜덤

        // 좌상단 기준이므로 조각의 절반만큼 빼서 정확히 중심에 놓기
        fragment.style.left = centerX - parseFloat(fragment.style.width) / 2 + 'px';
        fragment.style.top = centerY - parseFloat(fragment.style.height) / 2 + 'px';

        fragment.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        fragment.style.pointerEvents = 'none';
        fragment.style.zIndex = '1000';
        fragment.style.boxShadow = `0 0 ${Math.random() * 20 + 10}px ${Math.random() > 0.5 ? '#ff0000' : '#ff6600'}`;

        particleContainer.appendChild(fragment);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 500 + 200;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity + Math.random() * 200;
        const rotation = Math.random() * 1080 - 540;

        fragment.animate(
            [
                { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0) rotate(${rotation}deg)`, opacity: 0 }
            ],
            { duration: 2000, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }
        ).onfinish = () => fragment.remove();
    }
}



/* 버튼 붕괴 애니메이션 */
function createButtonCollapse() {
    /* 버튼 내부 빛 */

    const buttonRect = levelUpButton.getBoundingClientRect();
    const containerRect = particleContainer.getBoundingClientRect();
    // 컨테이너 기준 버튼 중심 좌표
    const centerX = buttonRect.left - containerRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top - containerRect.top + buttonRect.height / 2;

    const innerGlow = document.createElement('div');
    innerGlow.style.position = 'absolute';
    innerGlow.style.left = centerX + 'px';
    innerGlow.style.top = centerY + 'px';

    innerGlow.style.width = '20px';
    innerGlow.style.height = '20px';
    innerGlow.style.background = 'radial-gradient(circle, #ffffff, #ff0000, transparent)';
    innerGlow.style.transform = 'translate(-50%, -50%)';
    innerGlow.style.zIndex = '1000';
    innerGlow.style.borderRadius = '50%';

    particleContainer.appendChild(innerGlow);

    /* 내부 빛 확산 */
    innerGlow.animate([
        {
            width: '20px',
            height: '20px',
            opacity: 1
        },
        {
            width: '500px',
            height: '500px',
            opacity: 0
        }
    ], {
        duration: 1200,
        easing: 'ease-out'
    }).onfinish = () => innerGlow.remove();

    /* 버튼 글리치 효과 */
    levelUpButton.animate([
        { transform: 'scale(1)', filter: 'brightness(1) contrast(1)' },
        { transform: 'scale(1.05)', filter: 'brightness(2) contrast(1.5)', offset: 0.1 },
        { transform: 'scale(0.95)', filter: 'brightness(0.5) contrast(2)', offset: 0.2 },
        { transform: 'scale(1.1)', filter: 'brightness(3) contrast(0.5) hue-rotate(180deg)', offset: 0.3 },
        { transform: 'scale(0.9)', filter: 'brightness(0.2) contrast(3) saturate(0)', offset: 0.5 },
        { transform: 'scale(1.2)', filter: 'brightness(5) contrast(5) blur(5px)', offset: 0.7 },
        { transform: 'scale(0)', filter: 'brightness(0) blur(20px)', opacity: 0 }
    ], {
        duration: 1200,
        easing: 'ease-in'
    });


}

/* 디지털 노이즈 효과 */
function createDigitalNoise() {
    const buttonRect = levelUpButton.getBoundingClientRect();
    const containerRect = particleContainer.getBoundingClientRect();

    // 컨테이너 기준 버튼 중심 좌표
    const centerX = buttonRect.left - containerRect.left;
    const centerY = buttonRect.top - containerRect.top;

    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const noise = document.createElement('div');
            noise.style.position = 'absolute'; // 컨테이너 기준
            noise.style.left = centerX + Math.random() * buttonRect.width + 'px';
            noise.style.top = centerY + Math.random() * buttonRect.height + 'px';
            noise.style.width = Math.random() * 40 + 10 + 'px';
            noise.style.height = '2px';
            noise.style.background = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.8)`;
            noise.style.zIndex = '100';

            particleContainer.appendChild(noise);

            noise.animate([
                { transform: 'scaleX(1) translateX(0)', opacity: 1 },
                { transform: `scaleX(${Math.random() * 3}) translateX(${Math.random() * 100 - 50}px)`, opacity: 0 }
            ], {
                duration: 200,
                easing: 'steps(4)'
            }).onfinish = () => noise.remove();
        }, i * 50);
    }
}
/* 화면 크랙 효과 */
function createScreenCracks() {
    const buttonRect = levelUpButton.getBoundingClientRect();
    const containerRect = particleContainer.getBoundingClientRect();
    // 컨테이너 기준 버튼 중심 좌표
    const centerX = buttonRect.left - containerRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top - containerRect.top + buttonRect.height / 2;


    const cracks = document.createElement('div');
    cracks.style.position = 'absolute';
    cracks.style.left = centerX + 'px';
    cracks.style.top = centerY + 'px';
    cracks.style.transform = 'translate(-50%, -50%)';
    cracks.style.width = '100%';

    cracks.style.height = '100%';
    cracks.style.pointerEvents = 'none';
    cracks.style.zIndex = '999';

    particleContainer.appendChild(cracks);

    for (let i = 0; i < 8; i++) {
        const crack = document.createElement('div');
        crack.style.position = 'absolute';
        crack.style.width = '2px';
        crack.style.height = '0';
        crack.style.background = 'linear-gradient(to bottom, transparent, #ff0000, transparent)';
        crack.style.boxShadow = '0 0 20px #ff0000';
        crack.style.left = '50%';
        crack.style.top = '50%';
        crack.style.transformOrigin = 'top';
        crack.style.transform = `rotate(${i * 45}deg)`;

        cracks.appendChild(crack);

        crack.animate([
            { height: '0' },
            { height: '100vh' }
        ], {
            duration: 800,
            easing: 'ease-out',
            fill: 'forwards'
        });
    }

    setTimeout(() => cracks.remove(), 1500);
}

/* 우주 별 필드 생성 */
function createStarField() {
    const starsContainer = document.querySelector('.stars');

    // 200개 별 생성
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        //랜덤 위치
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';

        //랜덤 크기
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';

        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        star.style.animationDelay = Math.random() * 3 + 's';

        if (Math.random() > 0.7) {
            star.style.boxShadow = `0 0 ${size * 2}px rgba(255, 255, 255, 0.8)`;
        }

        starsContainer.appendChild(star);
    }
}



// 랭킹 통계 JSON 불러오기
// 랭킹은 사용 안하지만 구현해놔서 남겨둠
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
    .catch(err => console.error("불러오기 실패", err)
    );