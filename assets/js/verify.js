
//회원가입->메일발송됨
// AWS Cognito configuration

// AWS Cognito 구성 설정
const poolData = {
    UserPoolId: 'ap-northeast-2_qHoUh9Ggs', // AWS Cognito User Pool ID
    ClientId: '23h323cjmckg249ncd11fgh36r' // AWS Cognito App Client ID
};
// Cognito User Pool 객체 생성
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);



function toUsername(email) {
    return email.replace('@', '-at-');
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

// 확인 코드 제출 이벤트 리스너
document.getElementById('verifyForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const code = document.getElementById('verificationCode').value.trim();

    const username= toUsername(email) ;

    if (!username || !code) {
        document.getElementById('confirm-message').textContent = '사용자 이름과 확인 코드를 모두 입력해주세요.';
        return;
    }

    try {
        const result = await confirmSignUp(username, code);
        document.getElementById('confirm-message').textContent = '회원가입이 성공적으로 완료되었습니다!';
    } catch (error) {
        document.getElementById('confirm-message').textContent = '확인 실패: ' + (error.message || JSON.stringify(error));
    }
});