"# cognitoAuth" 
{"error":"User: arn:aws:sts::941377144067:assumed-role/auth-role-7w6whtr9/auth is not authorized to perform: cognito-idp:AdminGetUser on resource: arn:aws:cognito-idp:ap-northeast-2:941377144067:userpool/ap-northeast-2_n0oq31FbM because no identity-based policy allows the cognito-idp:AdminGetUser action","details":null} 이 오류 해결법

IAM 콘솔에 로그인: AWS Management Console에 로그인하고, IAM 콘솔로 이동합니다.

역할 생성 : 람다

"AmazonCognitoPowerUser" 권한추가후 람다에 역할연결


{"error":"Auth flow not enabled for this client","details":null} 해결법

이 오류 메시지 **"Auth flow not enabled for this client"**는 AWS Cognito 클라이언트에서 특정 인증 플로우(Auth Flow)가 활성화되지 않았을 때 발생합니다. 이 문제를 해결하려면, 해당 클라이언트에서 필요한 인증 플로우를 활성화해야 합니다.

해결 방법:
Cognito 콘솔로 이동: AWS Management Console에 로그인한 후 Amazon Cognito 서비스로 이동합니다.

사용 중인 User Pool 선택:

왼쪽 메뉴에서 **"User Pools"**를 선택하고, 해당 오류가 발생한 User Pool을 클릭합니다.
App Clients 설정:

User Pool 세부 정보 페이지에서 "App clients" 또는 "앱 클라이언트(App clients)" 섹션으로 이동합니다.
오류가 발생한 클라이언트를 선택합니다.
Auth Flow 설정 확인 및 수정:

선택한 클라이언트의 설정 페이지에서 "Show Details" 버튼을 클릭하여 세부 정보를 확인합니다.
아래로 스크롤하여 **"Enabled Identity Providers"**와 "Auth Flows Configuration" 섹션을 찾습니다.
인증 플로우 중 사용하려는 플로우가 비활성화되어 있을 경우, 해당 플로우를 활성화해야 합니다.
예를 들어, 다음 인증 플로우를 활성화할 수 있습니다:

ADMIN_NO_SRP_AUTH: SRP (Secure Remote Password) 없이 관리자가 인증하는 플로우.
USER_PASSWORD_AUTH: 사용자가 패스워드를 이용해 로그인하는 기본 인증 플로우.
CUSTOM_AUTH_FLOW_ONLY: 사용자 지정 인증 플로우만 사용하는 경우.
Auth Flow 활성화:

필요한 인증 플로우를 선택하고 저장(Save) 버튼을 클릭하여 변경 사항을 적용합니다.
Lambda 함수 또는 애플리케이션 확인:

Lambda 함수나 애플리케이션에서 올바른 인증 플로우를 사용하는지 확인합니다.
예를 들어, 인증 요청 시 AuthFlow 값이 올바르게 설정되었는지 확인하세요. (ADMIN_NO_SRP_AUTH, USER_PASSWORD_AUTH 등).

