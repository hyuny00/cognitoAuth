// AWS Cognito 구성 설정
const poolData = {
    UserPoolId: 'ap-northeast-2_qHoUh9Ggs', // AWS Cognito User Pool ID
    ClientId: '23h323cjmckg249ncd11fgh36r' // AWS Cognito App Client ID
};

// Cognito User Pool 객체 생성
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const authenticationData = {
        Username: email,
        Password: password
    };

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    const userData = {
        Username: toUsername(email),
        Pool: userPool
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {

             // 사용자 이름을 로컬 스토리지에 저장
            localStorage.setItem('username',  toUsername(email)); // 사용자 이름 저장

            // Access Token
            const accessToken = result.getAccessToken().getJwtToken();
            localStorage.setItem('accessToken', accessToken); 

            // ID Token
            const idToken = result.getIdToken().getJwtToken();
            localStorage.setItem('idToken', idToken); 

            // Refresh Token
            const refreshToken = result.getRefreshToken().getToken();
            localStorage.setItem('refreshToken', refreshToken); 


            document.getElementById("loginStatus").innerText = "Login successful!";
            console.log("Access Token: " + accessToken);

             // 다른 페이지로 이동
           window.location.href = 'auth.html'; // 다음 페이지의 URL로 변경하세요
        },
        onFailure: function (err) {
            document.getElementById("loginStatus").innerText = "Login failed: " + err.message;
            console.error(err);
        }
    });
});


function toUsername(email) {
    return email.replace('@', '-at-');
}

//로그아웃
// 현재 로그인한 사용자 가져오기
function getCurrentUser() {
    return userPool.getCurrentUser();
}

document.getElementById("logoutButton").addEventListener("click", function () {

    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
        console.error('No ID token found');
        return;
    }

             

    // ID 토큰 디코딩
    // ID 토큰 디코딩
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    
    // identityProvider 확인 로직 수정
    let identityProvider = 'Cognito';
    if (payload.identities) {
        const identities = typeof payload.identities === 'string' 
            ? JSON.parse(payload.identities) 
            : payload.identities;
        
        if (Array.isArray(identities) && identities.length > 0) {
            identityProvider = identities[0].providerName || 'Cognito';
        }
    }
    
    // 로컬 스토리지에서 토큰 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');

    localStorage.removeItem('username');

    if (identityProvider.toLowerCase() === 'google') {
        // 외부 공급자로 로그인한 경우
        console.log('User logged in with an external provider:', identityProvider.Value);
                        
        // 외부 공급자 로그아웃 처리 (예: Google 로그아웃)
        const logoutUrl = `https://tarrotok.auth.ap-northeast-2.amazoncognito.com/logout?client_id=23h323cjmckg249ncd11fgh36r&logout_uri=${encodeURIComponent('https://main.d2ri753qyvsils.amplifyapp.com/login.html')}`;
        window.location.href = logoutUrl; // Cognito 로그아웃
    }else{
        const cognitoUser = getCurrentUser();

        if (cognitoUser) {
            cognitoUser.signOut(); // 로그아웃 처리
    
            document.getElementById("logoutStatus").innerText = "You have been logged out.";
        } else {
            document.getElementById("logoutStatus").innerText = "No user is logged in.";
        }

    }

  

/*
    if (cognitoUser) {
        cognitoUser.signOut(); // 로그아웃 처리

         // 로컬 스토리지에서 토큰 삭제
         localStorage.removeItem('accessToken');
         localStorage.removeItem('idToken');
         localStorage.removeItem('refreshToken');

         localStorage.removeItem('username');
         

         
        document.getElementById("logoutStatus").innerText = "You have been logged out.";
    } else {
        document.getElementById("logoutStatus").innerText = "No user is logged in.";
    }
*/
    /*이 코드는 로컬 세션 로그아웃만 처리해요. 만약 글로벌 로그아웃(모든 기기에서 로그아웃)을 하고 싶다면, 다음과 같이 globalSignOut()을 사용할 수 있어요:
    cognitoUser.globalSignOut({
        onSuccess: function () {
            document.getElementById("logoutStatus").innerText = "Global sign out successful!";
        },
        onFailure: function (err) {
            document.getElementById("logoutStatus").innerText = "Global sign out failed: " + err.message;
        }
    });
    */
    
});





// API 요청 함수
function makeApiRequest(accessToken) {


    fetch('https://your-api-id.execute-api.region.amazonaws.com/your-stage/your-resource', {
        method: 'GET', // 요청 메서드
        headers: {
            'Authorization': accessToken, // Access Token 포함
            'Content-Type': 'application/json' // Content-Type 설정
        }
    })
    .then(response => {
        if (response.status === 401) {
            // Access Token이 만료된 경우
            console.log("Access Token expired. Refreshing...");
            refreshAccessToken(); // 새로운 Access Token 요청
        } else if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('API Response:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Refresh Token으로 새로운 Access Token 요청
function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken'); // 로컬 스토리지에서 Refresh Token 가져오기
    const username = localStorage.getItem('username');
    
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
        Username: username,
        Pool: userPool
    });

    cognitoUser.refreshSession(new AmazonCognitoIdentity.CognitoRefreshToken({ RefreshToken: refreshToken }), (err, session) => {
        if (err) {
            console.error("Failed to refresh session:", err);
            // Refresh Token이 만료된 경우 로그인 페이지로 리다이렉트
            if (err.code === 'NotAuthorizedException' || err.message.includes('Refresh Token has expired')) {
                alert("Session expired. Redirecting to login page.");
                window.location.href = '/login.html'; // 로그인 페이지로 리다이렉트
            }
            return;
        }
        
        // 새로운 Access Token 저장
        const newAccessToken = session.getAccessToken().getJwtToken();
        localStorage.setItem('accessToken', newAccessToken);
        console.log("New Access Token obtained and stored.");

        // 새로운 Access Token으로 API 요청을 다시 시도합니다.
        makeApiRequest(newAccessToken); // 다시 요청 보내기
    });
}
