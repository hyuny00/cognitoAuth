
const apiUrlBoard = 'https://0h8fnl8ir8.execute-api.ap-northeast-2.amazonaws.com/prod/boards';



const apiUrl = 'https://0h8fnl8ir8.execute-api.ap-northeast-2.amazonaws.com/prod/posts';

const replyApiUrl = 'https://0h8fnl8ir8.execute-api.ap-northeast-2.amazonaws.com/prod/replies';

const presignedUrl = 'https://0h8fnl8ir8.execute-api.ap-northeast-2.amazonaws.com/prod/presignedurl';


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
      <p>댓글 : ${post.ReplyCount}</p>
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


        replyList();
       
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

        replyList();
    } else {
        alert('댓글 작성에 실패했습니다.');
    }
});

function createReplyList(replies) {
    const ul = document.createElement('ul');

    replies.forEach(reply => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${reply.Content}</strong> <br> <small>Created: ${new Date(reply.CreationDate).toLocaleString()}</small>
          <button onclick="setReplyToReply('${reply.SK}')">대댓글 작성</button>`;
        
        if (reply.children && reply.children.length > 0) {
            const childUl = createReplyList(reply.children);
            li.appendChild(childUl);
        }

        ul.appendChild(li);
    });

    return ul;
}

async function replyList(){

    const postId = document.getElementById('postId').value;
    const boardType = document.getElementById('boardType').value;

    const url = new URL(`${replyApiUrl}/${boardType}/${postId}`);

    console.log('hh..:'+url);

    const replyList = document.getElementById('replyList');
  
    try {


      const response = await fetch(url);
      const replies = await response.json();
    
      if (response.ok) {

        // 기존 댓글 목록을 비운다.
        replyList.innerHTML = ''; 

        replyList.appendChild(createReplyList(replies));
       
      } 
    } catch (error) {
      console.error('Network error:', error);
 
    }

}

// Set parentReplyId when replying to a reply
function setReplyToReply(parentReplySK) {
    document.getElementById('parentReplySK').value = parentReplySK;
}



document.getElementById('createNestedReplyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const postId = document.getElementById('postId').value;
    const boardType = document.getElementById('boardType').value;
    const parentReplySK = document.getElementById('parentReplySK').value;
    const nestedReplyContent = document.getElementById('nestedReplyContent').value;

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
        body: JSON.stringify({parentReplySK : parentReplySK,  content: nestedReplyContent })
    });

    if (response.ok) {
        alert('대댓글이 성공적으로 작성되었습니다.');
        document.getElementById('createNestedReplyForm').reset();
        replyList();

    } else {
        alert('대댓글 작성에 실패했습니다.');
    }
});


const fileNames = [];
document.getElementById('fileInput').addEventListener('change', async (event) => {

    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
        alert('로그인이 필요합니다.');
        return;
    }

    const file = event.target.files[0]; // 선택한 파일

    if (file) {

        // 파일 타입 확인
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            document.getElementById('uploadStatus').textContent = '이미지 파일만 업로드할 수 있습니다.';
            return;
        }

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const timestamp = date.getTime();  // 타임스탬프 (밀리초 단위)

        const tempFileName = `${file.name}.TEMP`

        // 타임스탬프를 파일 이름에 추가
        const uploadKey = `uploads/${year}/${month}/${timestamp}-${tempFileName}`;
       

        console.log(tempFileName+":"+file.type);

        console.log(presignedUrl);

        console.log("uploadKey:"+uploadKey);

        try {
            // 서버에 미리 서명된 URL 요청
            const response = await fetch(presignedUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${idToken}`, // Cognito JWT를 Authorization 헤더에 포함
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: uploadKey, // 설정한 키를 사용
                    fileType: file.type,
                }),
            });

            if (!response.ok) {
                throw new Error('서명된 URL 요청 실패');
            }else{
                fileNames.push(uploadKey);
            }

            const { url } = await response.json();


            console.log('presignedUrl:'+url);

            // 서명된 URL을 사용하여 S3에 파일 업로드
            const uploadResponse = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type,
                },
                body: file,
            });

            if (!uploadResponse.ok) {
                throw new Error('파일 업로드 실패');
            }

            console.log(fileNames);

            document.getElementById('uploadStatus').textContent = '업로드 성공!';
        } catch (error) {
            console.error('오류 발생:', error);
            document.getElementById('uploadStatus').textContent = '업로드 실패: ' + error.message;
        }
    } else {
        alert('파일을 선택하세요.');
    }
        
});