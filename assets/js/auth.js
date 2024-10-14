// AWS Cognito configuration
const poolData = {
    UserPoolId: 'ap-northeast-2_2b6h6ORAM',
    ClientId: '6kcegkothq1lmddpivs859mucq'
};

const mainPage='https://main.d2ri753qyvsils.amplifyapp.com';

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

function toUsername(email) {
    return email.replace('@', '-at-');
}

document.addEventListener('DOMContentLoaded', function() {
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

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
                    localStorage.setItem('username', toUsername(email));
                    localStorage.setItem('accessToken', result.getAccessToken().getJwtToken());
                    localStorage.setItem('idToken', result.getIdToken().getJwtToken());
                    localStorage.setItem('refreshToken', result.getRefreshToken().getToken());

                    document.getElementById('loginStatus').textContent = "Login successful!";
                    window.location.href = 'auth.html';
                },
                onFailure: function (err) {
                    document.getElementById('loginStatus').textContent = "Login failed: " + err.message;
                    console.error(err);
                }
            });
        });
    }

    // Logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            const idToken = localStorage.getItem('idToken');
            if (!idToken) {
                console.error('No ID token found');
                return;
            }

            const payload = JSON.parse(atob(idToken.split('.')[1]));
            const googleAccessToken = payload['custom:access_token'];
            
            let identityProvider = 'Cognito';
            if (payload.identities) {
                const identities = typeof payload.identities === 'string' 
                    ? JSON.parse(payload.identities) 
                    : payload.identities;
                
                if (Array.isArray(identities) && identities.length > 0) {
                    identityProvider = identities[0].providerName || 'Cognito';
                }
            }
            
            const cognitoUser = userPool.getCurrentUser();

            if (identityProvider.toLowerCase() === 'google') {
                console.log('User logged in with Google');
                
                fetch(`https://accounts.google.com/o/oauth2/revoke?token=${googleAccessToken}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).then(() => {
                    logoutCognitoHostedUI();
                }).catch(() => {
                    logoutCognitoHostedUI();
                });
            } else if (cognitoUser) {
                console.log('User logged in with Cognito');
                cognitoUser.signOut();
                clearLocalStorage();
                window.location.href = mainPage;
            } else {
                
                const kakaoAccessToken = localStorage.getItem('kakaoAccessToken');

                if(kakaoAccessToken){
                    // 카카오 토큰 취소
                    fetch('https://kapi.kakao.com/v1/user/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${kakaoAccessToken}`
                        }
                    })
                    .then(response => {
    
                        if (!response.ok) {
                            throw new Error('kakao token revocation failed');
                        }
    
                        console.log('kakao token revoked successfully');
                    }) 
                    .catch(error => {
                        console.error('Error revoking kakao token:', error);
                    })
                    .finally(() => {
    
                        // 로컬 스토리지에서 토큰 삭제
                        clearLocalStorage();;
                        localStorage.removeItem('kakaoAccessToken');
                                         
                        window.location.href = mainPage;
                    });
    
                }
            }
        });
    }

    // Signup
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var nickName = document.getElementById('nickName').value;
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;

            var dataEmail = {
                Name: 'email',
                Value: email
            };

            var dataNickName = {
                Name: 'nickname',
                Value: nickName
            };

            var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
            var attributeNickName = new AmazonCognitoIdentity.CognitoUserAttribute(dataNickName);
            
            userPool.signUp(toUsername(email), password, [attributeEmail, attributeNickName], null,
                function signUpCallback(err, result) {
                    if (err) {
                        console.log(err.message || JSON.stringify(err));
                        document.getElementById('message').textContent = 'Error: ' + (err.message || JSON.stringify(err));
                    } else {
                        console.log('Sign-up success:', result);
                        document.getElementById('message').textContent = 'Sign-up successful! Please check your email for confirmation.';
                    }
                }
            );
        });
    }

    // Update User Profile
    const updateProfileForm = document.getElementById('update-profile-form');
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const newNickname = document.getElementById('new-nickname').value.trim();
            const oldPassword = document.getElementById('old-password').value;
            const newPassword = document.getElementById('new-password').value;

            getCurrentUser().then(function(cognitoUser) {
                return getUserAttributes(cognitoUser).then(function(userInfo) {
                    let updatePromises = [];

                    if (newNickname && newNickname !== userInfo.nickname) {
                        updatePromises.push(updateNickname(cognitoUser, newNickname));
                    }

                    if (oldPassword && newPassword) {
                        updatePromises.push(changePassword(cognitoUser, oldPassword, newPassword));
                    }

                    return Promise.all(updatePromises);
                });
            }).then(function() {
                document.getElementById('update-message').textContent = '프로필이 성공적으로 업데이트되었습니다.';
            }).catch(function(error) {
                console.error('프로필 업데이트 실패:', error);
                document.getElementById('update-message').textContent = '프로필 업데이트 실패: ' + (error.message || JSON.stringify(error));
            });
        });
    }

    // Verify
    const verifyForm = document.getElementById('verifyForm');
    if (verifyForm) {
        verifyForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const code = document.getElementById('verificationCode').value.trim();

            const username = toUsername(email);

            if (!username || !code) {
                document.getElementById('confirm-message').textContent = '사용자 이름과 확인 코드를 모두 입력해주세요.';
                return;
            }

            confirmSignUp(username, code).then(function(result) {
                document.getElementById('confirm-message').textContent = '회원가입이 성공적으로 완료되었습니다!';
            }).catch(function(error) {
                document.getElementById('confirm-message').textContent = '확인 실패: ' + (error.message || JSON.stringify(error));
            });
        });
    }
});

// Helper functions
function getCurrentUser() {
    return new Promise((resolve, reject) => {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser != null) {
            cognitoUser.getSession((err, session) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (session.isValid()) {
                    resolve(cognitoUser);
                } else {
                    reject(new Error('Invalid session'));
                }
            });
        } else {
            reject(new Error('No current user'));
        }
    });
}

function getUserAttributes(cognitoUser) {
    return new Promise((resolve, reject) => {
        cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
                reject(err);
            } else {
                const userInfo = {};
                for (let attribute of attributes) {
                    userInfo[attribute.getName()] = attribute.getValue();
                }
                resolve(userInfo);
            }
        });
    });
}

function updateNickname(cognitoUser, newNickname) {
    return new Promise((resolve, reject) => {
        const attributeList = [
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'nickname',
                Value: newNickname
            })
        ];

        cognitoUser.updateAttributes(attributeList, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function changePassword(cognitoUser, oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
        cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function confirmSignUp(username, code) {
    return new Promise((resolve, reject) => {
        const userData = {
            Username: username,
            Pool: userPool
        };

        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) {
                console.error('확인 코드 등록 실패:', err);
                reject(err);
            } else {
                console.log('확인 코드 등록 성공:', result);
                resolve(result);
            }
        });
    });
}

function logoutCognitoHostedUI() {
    const clientId = poolData.ClientId;
    
    clearLocalStorage();
    const logoutUrl = `https://tarotok.auth.ap-northeast-2.amazoncognito.com/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(mainPage)}`;
    window.location.href = logoutUrl;
}

function clearLocalStorage() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
}


function decodeJwtPayload(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    return JSON.parse(jsonPayload);
  }

function getUserInfo() {
    const idToken = localStorage.getItem('idToken'); // 저장된 ID Token을 가져옵니다.

    if (idToken) {

        const payload= decodeJwtPayload(idToken);
        if(payload){
            console.log('Payload:', payload);

            const username = payload['email'];
            const nickname = payload['nickname']

            document.getElementById('usernm').innerText = 'login success, token: ' + username+'|'+ nickname;
        } else {
            console.error('Invalid JWT structure');
        }
    }
}