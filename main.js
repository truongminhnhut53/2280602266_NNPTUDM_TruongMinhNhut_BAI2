const POST_API = "http://localhost:3000/posts";
const COMMENT_API = "http://localhost:3000/comments";

/* ================= POSTS ================= */

// Load posts
async function LoadPosts() {
    let res = await fetch(POST_API);
    let posts = await res.json();

    let table = document.getElementById("post_table");
    table.innerHTML = "";

    posts.forEach(p => {
        let rowClass = p.isDeleted ? "deleted" : "";
        table.innerHTML += `
        <tr class="${rowClass}">
            <td>${p.id}</td>
            <td>${p.title}</td>
            <td>${p.views}</td>
            <td>
                <button class="delete-btn" onclick="SoftDeletePost('${p.id}')">Delete</button>
            </td>
        </tr>`;
    });
}

// Lấy ID mới = max + 1
async function getNewPostId() {
    let res = await fetch(POST_API);
    let posts = await res.json();

    let maxId = 0;
    posts.forEach(p => {
        let n = parseInt(p.id);
        if (!isNaN(n) && n > maxId) maxId = n;
    });

    return String(maxId + 1);
}

// Kiểm tra post có tồn tại không
async function postExists(id) {
    let res = await fetch(`${POST_API}/${id}`);
    return res.ok;
}

// Save (Create / Update)
async function SavePost() {
    let id = document.getElementById("post_id").value.trim();
    let title = document.getElementById("post_title").value.trim();
    let views = document.getElementById("post_views").value.trim();

    if (!title || !views) {
        alert("Vui lòng nhập đầy đủ dữ liệu");
        return false;
    }

    // UPDATE
    if (id && await postExists(id)) {
        await fetch(`${POST_API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id,
                title,
                views,
                isDeleted: false
            })
        });
    }
    // CREATE
    else {
        let newId = await getNewPostId();
        await fetch(POST_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: newId,
                title,
                views,
                isDeleted: false
            })
        });
    }

    clearPostForm();
    LoadPosts();
    return false;
}

// Clear form
function clearPostForm() {
    document.getElementById("post_id").value = "";
    document.getElementById("post_title").value = "";
    document.getElementById("post_views").value = "";
}

// Soft delete
async function SoftDeletePost(id) {
    let res = await fetch(`${POST_API}/${id}`);
    let post = await res.json();

    await fetch(`${POST_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...post,
            isDeleted: true
        })
    });

    LoadPosts();
}

/* ================= COMMENTS ================= */

// Load comments
async function LoadComments() {
    let res = await fetch(COMMENT_API);
    let comments = await res.json();

    let table = document.getElementById("comment_table");
    table.innerHTML = "";

    comments.forEach(c => {
        table.innerHTML += `
        <tr>
            <td>${c.id}</td>
            <td>${c.text}</td>
            <td>${c.postId}</td>
            <td>
                <button class="delete-btn" onclick="DeleteComment('${c.id}')">Delete</button>
            </td>
        </tr>`;
    });
}

// New comment ID
async function getNewCommentId() {
    let res = await fetch(COMMENT_API);
    let comments = await res.json();

    let maxId = 0;
    comments.forEach(c => {
        let n = parseInt(c.id);
        if (!isNaN(n) && n > maxId) maxId = n;
    });

    return String(maxId + 1);
}

// Add comment
async function AddComment() {
    let text = document.getElementById("comment_text").value.trim();
    let postId = document.getElementById("comment_postid").value.trim();

    if (!text || !postId) {
        alert("Vui lòng nhập đầy đủ comment");
        return false;
    }

    let newId = await getNewCommentId();

    await fetch(COMMENT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: newId,
            text,
            postId
        })
    });

    document.getElementById("comment_text").value = "";
    document.getElementById("comment_postid").value = "";

    LoadComments();
    return false;
}

// Delete comment
async function DeleteComment(id) {
    await fetch(`${COMMENT_API}/${id}`, { method: "DELETE" });
    LoadComments();
}

/* ================= INIT ================= */

LoadPosts();
LoadComments();
