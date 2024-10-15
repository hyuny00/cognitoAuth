
const apiUrl = 'https://0h8fnl8ir8.execute-api.ap-northeast-2.amazonaws.com/prod/boards'

// 게시판 생성
document.getElementById('createBoardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boardType = document.getElementById('boardType').value;
    const boardName = document.getElementById('boardName').value;
    const description = document.getElementById('boardDescription').value;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
    }

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ boardType, boardName, description })
    });

    if (response.ok) {
        alert('게시판이 성공적으로 생성되었습니다.');
        document.getElementById('createBoardForm').reset();
    } else {
        alert('게시판 생성에 실패했습니다.');
    }
});

// 게시판 수정
document.getElementById('editBoardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boardId = document.getElementById('editBoardId').value;
    const newBoardType = document.getElementById('newBoardType').value;
    const newDescription = document.getElementById('newBoardDescription').value;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
    }

    const response = await fetch(`${apiUrl}/${boardId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
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

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
    }

    const response = await fetch(`${apiUrl}/${boardId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        alert('게시판이 성공적으로 삭제되었습니다.');
        document.getElementById('deleteBoardForm').reset();
    } else {
        alert('게시판 삭제에 실패했습니다.');
    }
});

// 게시판 조회
document.getElementById('viewBoardsBtn').addEventListener('click', async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
    }

    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
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
            li.textContent = `Name: ${board.BoardName}, Description: ${board.Description}`;
            li.classList.add('list-group-item');
            boardList.appendChild(li);
        });
    } else {
        alert('게시판 조회에 실패했습니다.');
    }
});
