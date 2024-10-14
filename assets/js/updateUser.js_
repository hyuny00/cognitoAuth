// AWS Cognito 구성 설정
const poolData = {
    UserPoolId: 'ap-northeast-2_2b6h6ORAM', // AWS Cognito User Pool ID
    ClientId: '6kcegkothq1lmddpivs859mucq' // AWS Cognito App Client ID
};

// Cognito User Pool 객체 생성
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);



// 현재 인증된 사용자 가져오기
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

// 사용자 속성 가져오기
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

// 닉네임 업데이트
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

// 비밀번호 변경
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

// 프로필 업데이트 이벤트 리스너
document.getElementById('update-profile-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const newNickname = document.getElementById('new-nickname').value.trim();
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;

    try {
        const cognitoUser = await getCurrentUser();
        const userInfo = await getUserAttributes(cognitoUser);

        if (newNickname && newNickname !== userInfo.nickname) {
            await updateNickname(cognitoUser, newNickname);
            console.log('닉네임이 성공적으로 업데이트되었습니다.');
        }

        if (oldPassword && newPassword) {
            await changePassword(cognitoUser, oldPassword, newPassword);
            console.log('비밀번호가 성공적으로 변경되었습니다.');
        }

        document.getElementById('update-message').textContent = '프로필이 성공적으로 업데이트되었습니다.';
    } catch (error) {
        console.error('프로필 업데이트 실패:', error);
        document.getElementById('update-message').textContent = '프로필 업데이트 실패: ' + (error.message || JSON.stringify(error));
    }
});