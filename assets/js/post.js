
const apiUrlBoard = 'https://0h8fnl8ir8.execute-api.ap-northeast-2.amazonaws.com/prod/boards';



const apiUrl = 'https://0h8fnl8ir8.execute-api.ap-northeast-2.amazonaws.com/prod/posts';

const replyApiUrl = 'https://0h8fnl8ir8.execute-api.ap-northeast-2.amazonaws.com/prod/replies';


document.addEventListener('DOMContentLoaded', function() {

    listBoards();


});

function listBoards(){

    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
        alert('로그인이 필요합니다.');
        return;
    }

 // Fetch API로 데이터 가져오기
 fetch(apiUrlBoard, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
    }
})
 .then(response => {
     if (!response.ok) {
         throw new Error('Network response was not ok');
     }
     return response.json(); // JSON 형식으로 변환
 })
 .then(data => {
    
     const selectElement = document.getElementById('boardType');

     const selectElement2 = document.getElementById('selectedBoard');
     

     // 기존 옵션을 지우고 새 옵션 추가
     selectElement.innerHTML = '';
     selectElement2.innerHTML = '';

     console.log(data);

     // 새로운 옵션 추가
     data.forEach(item => {

        const boardType =  item.PK; 

        const option = document.createElement('option');
        option.value = boardType.split('#')[1];
        option.textContent = item.BoardName;

        selectElement.appendChild(option);

        const option2 = document.createElement('option');
        option2.value = boardType.split('#')[1];
        option2.textContent = item.BoardName;
        selectElement2.appendChild(option2);
     });
 })
 .catch(error => {
     console.error('Fetch error:', error); // 오류 처리
 });


}



// 게시글 작성
document.getElementById('createPostForm').addEventListener('submit', async (e) => {

    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
        alert('로그인이 필요합니다.');
        return;
    }

    e.preventDefault();
    const boardType = document.getElementById('boardType').value;
    const postTitle = document.getElementById('postTitle').value;
    const postContent = document.getElementById('postContent').value;



    const response = await fetch(`${apiUrl}/${boardType}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`, // Cognito JWT를 Authorization 헤더에 포함
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: postTitle, content: postContent })
    });

    if (response.ok) {
        alert('게시글이 성공적으로 작성되었습니다.');
        document.getElementById('createPostForm').reset();
    } else {
        alert('게시글 작성에 실패했습니다.');
    }
});

// 게시글 목록 불러오기
document.getElementById('loadPostsBtn').addEventListener('click', async () => {

    loadPosts();
});


async function fetchPosts(boardType, lastKey = null) {
    const url = new URL(`${apiUrl}/${boardType}`);
    
    const params = {};
    if (lastKey) {
      params.lastKey = JSON.stringify(lastKey);
    }
  
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
    try {

        console.log('mmm....:'+url);
      const response = await fetch(url);
      const data = await response.json();

   
      
      if (response.ok) {
        return data;
      } else {
        console.error('Error fetching posts:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Network error:', error);
      return null;
    }
  }

  function renderPosts(posts) {
    const postList = document.getElementById('postList');
  
    // 받은 데이터를 순회하며 DOM에 추가
    posts.forEach(post => {
      const listItem = document.createElement('li'); // 혹은 <div>
      //listItem.textContent = post.Title; // 여기서 title은 게시글 제목을 가정 (실제 속성명에 맞게 수정)
  
      // 필요하다면 게시글의 추가 정보를 표시
      listItem.innerHTML = `
      <strong>
          <a href="javascript:void(0);" onclick="readPost('${post.PK}', '${post.SK}')">
              제목 : ${post.Title}
          </a>
      </strong>
      <p>내용 : ${post.Content}</p>
   `;
  
      postList.appendChild(listItem); // 리스트에 추가
    });
  }


  // 초기화 변수
let lastKey = null;


// 게시글 로드 함수
function loadPosts() {
    const boardType = document.getElementById('selectedBoard').value;

    // fetchPosts를 항상 호출하여 첫 번째 요청 시에도 게시물 가져오기
    fetchPosts(boardType, lastKey).then(data => {
        if (data && data.posts) {
            renderPosts(data.posts); // 가져온 데이터를 DOM에 추가

            // 다음 페이지 요청을 위해 lastEvaluatedKey 저장
            lastKey = data.lastEvaluatedKey;

            console.log("lastKey...:"+JSON.stringify(lastKey));

            // 더 이상 데이터가 없으면 버튼 숨기거나 비활성화
            if (!lastKey) {
                console.log('No more posts to load.');
                document.getElementById('loadPostsBtn').disabled = true; // 버튼 비활성화
            }
        } else {
            console.log('No posts found.');
            document.getElementById('loadPostsBtn').disabled = true; // 버튼 비활성화
        }
    });
}


async function readPost(PK, SK){

    const boardType = PK.split('#')[1];
    const postId = SK.split('#')[1];

    console.log('postId:'+postId);
    console.log('boardType:'+boardType);

    const url = new URL(`${apiUrl}/${boardType}/${postId}`);
    
  
    try {

      console.log('readPost....:'+url);
      const response = await fetch(url);
      const post = await response.json();

      if (response.ok) {

        const postDetail = document.getElementById('postDetail');

        // 게시물의 세부 정보를 설정합니다.
        postDetail.innerHTML = `
            <strong>제목: ${post.Title}</strong><br>
            <p>내용: ${post.Content}</p><br>
            <p>작성 날짜: ${new Date(post.CreationDate).toLocaleString()}</p>
        `;
        document.getElementById('postId').value=postId;
        document.getElementById('boardType').value=boardType;


        
       
      } else {
        console.error('Error fetching posts:', post.message);
       
      }
    } catch (error) {
      console.error('Network error:', error);
 
    }

}

/*
// 스크롤이 끝까지 내려가면 자동으로 다음 페이지 로드
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && lastKey) {
      loadPosts(); // 다음 페이지 로드
    }
  });
  */

// 댓글 작성
document.getElementById('createReplyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const postId = document.getElementById('postId').value;
    const boardType = document.getElementById('boardType').value;
    const replyContent = document.getElementById('replyContent').value;

     // 로컬스토리지에서 accessToken 가져오기 (Cognito에서 로그인 후 저장된 토큰)
     const idToken = localStorage.getItem('idToken');
     if (!idToken) {
         alert('로그인이 필요합니다.');
         return;
     }

     
    const response = await fetch(`${replyApiUrl}/${boardType}/${postId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`, 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: replyContent })
    });

    if (response.ok) {
        alert('댓글이 성공적으로 작성되었습니다.');
        document.getElementById('createReplyForm').reset();
    } else {
        alert('댓글 작성에 실패했습니다.');
    }
});


async function replyList(PK, SK){


}



