
//회원가입->메일발송됨
// AWS Cognito configuration

// AWS Cognito 구성 설정
const poolData = {
    UserPoolId: 'ap-northeast-2_qHoUh9Ggs', // AWS Cognito User Pool ID
    ClientId: '23h323cjmckg249ncd11fgh36r' // AWS Cognito App Client ID
};
// Cognito User Pool 객체 생성
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);



document.getElementById('signup-form').addEventListener('submit', function (e) {
    e.preventDefault();

    //var name = document.getElementById('name').value;
    var nickName = document.getElementById('nickName').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    var dataEmail = {
        Name: 'email',
        Value: email
    };

    var dataNickName = {
        Name: 'nickname',  // 'custom:' 접두사 제거
        Value: nickName
    };

    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    var attributeNickName = new AmazonCognitoIdentity.CognitoUserAttribute(dataNickName);
    
    userPool.signUp(toUsername(email), password, [attributeEmail,attributeNickName], null,
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


function toUsername(email) {
    return email.replace('@', '-at-');
}


