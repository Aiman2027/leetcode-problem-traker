const leetcode_problem_key = "leetcode_problem_key";

const assetsURLMap = {
    play: chrome.runtime.getURL("assets/play.png"),
    delete: chrome.runtime.getURL("assets/delete.png")
};

let bookmarkSection;

document.addEventListener("DOMContentLoaded", () => {
    bookmarkSection = document.getElementById("bookmarks");

    chrome.storage.sync.get([leetcode_problem_key], (data) => {
        const bookmarks = data[leetcode_problem_key] || [];
        viewBookmarks(bookmarks);
    });
});

function viewBookmarks(bookmarks) {
    bookmarkSection.innerHTML = "";

    if (bookmarks.length === 0) {
        bookmarkSection.innerHTML = "<i>No Bookmarks to Show</i>";
        return;
    }

    bookmarks.forEach(addNewBookmark);
}

function addNewBookmark(bookmark) {
    const newBookmark = document.createElement("div");
    const bookmarkTitle = document.createElement("div");
    const bookmarkControls = document.createElement("div");

    bookmarkTitle.textContent = bookmark.name;
    bookmarkTitle.className = "bookmark-title";

    setControlAttributes(assetsURLMap.play, onPlay, bookmarkControls);
    setControlAttributes(assetsURLMap.delete, onDelete, bookmarkControls);

    bookmarkControls.className = "bookmark-controls";
    newBookmark.className = "bookmark";

    newBookmark.setAttribute("url", bookmark.url);
    newBookmark.setAttribute("bookmark-id", bookmark.id);

    newBookmark.append(bookmarkTitle, bookmarkControls);
    bookmarkSection.appendChild(newBookmark);
}

function setControlAttributes(src, handler, parent) {
    const img = document.createElement("img");
    img.src = src;
    img.addEventListener("click", handler);
    parent.appendChild(img);
}

function onPlay(e) {
    const url = e.target.closest(".bookmark").getAttribute("url");
    window.open(url, "_blank");
}

function onDelete(e) {
    const bookmarkItem = e.target.closest(".bookmark");
    const id = bookmarkItem.getAttribute("bookmark-id");

    bookmarkItem.remove();
    deleteItemFromStorage(id);
}

function deleteItemFromStorage(idToRemove) {
    chrome.storage.sync.get([leetcode_problem_key], (data) => {
        const bookmarks = data[leetcode_problem_key] || [];
        const updated = bookmarks.filter(
            b => b.id !== idToRemove
        );

        chrome.storage.sync.set({ [leetcode_problem_key]: updated });
    });
}
