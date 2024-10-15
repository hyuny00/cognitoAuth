
const apiUrl = 'https://0h8fnl8ir8.execute-api.ap-northeast-2.amazonaws.com/prod/boards'

// 게시판 생성
document.getElementById('createBoardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boardType = document.getElementById('boardType').value;
    const boardName = document.getElementById('boardName').value;
    const description = document.getElementById('boardDescription').value;

    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
        alert('로그인이 필요합니다.');
        return;
    }
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ boardType, boardName, description }),
        });

        if (response.ok) {
            alert('게시판이 성공적으로 생성되었습니다.');
            document.getElementById('createBoardForm').reset();
        } else {
            const errorMessage = await response.text(); 
            throw new Error(`Error: ${response.status} - ${errorMessage}`);
        }
    } catch (error) {
        
        console.error('Fetch error:', error.message);
        alert('게시판생성이 실패했습니다.');
        document.getElementById('createBoardForm').reset();
       
    }
});

// 게시판 수정
document.getElementById('editBoardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boardId = document.getElementById('editBoardId').value;
    const newBoardType = document.getElementById('newBoardType').value;
    const newDescription = document.getElementById('newBoardDescription').value;

    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
        alert('로그인이 필요합니다.');
        return;
    }

    const response = await fetch(`${apiUrl}/${boardId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ boardType: newBoardType, description: newDescription })
    });

    if (response.ok) {
        alert('게시판이 성공적으로 수정되었습니다.');
        document.getElementById('editBoardForm').reset();
    } else {
        alert('게시판 수정에 실패했습니다.');
    }
});

// 게시판 삭제
document.getElementById('deleteBoardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boardId = document.getElementById('deleteBoardId').value;

    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
        alert('로그인이 필요합니다.');
        return;
    }

    const response = await fetch(`${apiUrl}/${boardId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        }
    });
    console.log(response);
    if (response.ok) {
        alert('게시판이 성공적으로 삭제되었습니다.');
        document.getElementById('deleteBoardForm').reset();
    } else {
        alert('게시판 삭제에 실패했습니다.');
    }
});

// 게시판 조회
document.getElementById('viewBoardsBtn').addEventListener('click', async () => {
    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
        alert('로그인이 필요합니다.');
        return;
    }

    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const boards = await response.json();

        console.log(boards);
        const boardList = document.getElementById('boardList');
        boardList.innerHTML = '';

        boards.forEach(board => {
            const li = document.createElement('li');
            li.textContent = `PK: ${board.PK}, Name: ${board.BoardName}, Description: ${board.Description}`;
            li.classList.add('list-group-item');
            boardList.appendChild(li);
        });
    } else {
        alert('게시판 조회에 실패했습니다.');
    }
});
