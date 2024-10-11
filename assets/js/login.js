// AWS Cognito 구성 설정
const poolData = {
    UserPoolId: 'ap-northeast-2_n0oq31FbM', // AWS Cognito User Pool ID
    ClientId: '4fdppqal2tjbtpcqjpnan1au3n' // AWS Cognito App Client ID
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


// 현재 로그인한 사용자 가져오기
function getCurrentUser() {
    return userPool.getCurrentUser();
}

document.getElementById("logoutButton").addEventListener("click", function () {
    const cognitoUser = getCurrentUser();

    if (cognitoUser) {
        cognitoUser.signOut(); // 로그아웃 처리

         // 로컬 스토리지에서 토큰 삭제
         localStorage.removeItem('accessToken');
         localStorage.removeItem('idToken');
         localStorage.removeItem('refreshToken');

         
        document.getElementById("logoutStatus").innerText = "You have been logged out.";
    } else {
        document.getElementById("logoutStatus").innerText = "No user is logged in.";
    }

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

