const bookmarkImgURL = chrome.runtime.getURL("assets/bookmark.png");
const leetcode_problem_key = "leetcode_problem_key";


function injectBookmarkButton() {
    const observer = new MutationObserver(() => {

        const titleEl =
            document.querySelector("h4") ||
            document.querySelector(".text-title-large");

        if (!titleEl) return;

        // prevent duplicate button
        if (document.getElementById("add-bookmark-button")) return;

        const wrapper = titleEl.parentElement;
        if (!wrapper) return;

        const bookmarkButton = document.createElement("img");
        bookmarkButton.id = "add-bookmark-button";
        bookmarkButton.src = bookmarkImgURL;

        bookmarkButton.style.height = "28px";
        bookmarkButton.style.width = "28px";
        bookmarkButton.style.cursor = "pointer";
        bookmarkButton.style.marginLeft = "10px";
        bookmarkButton.style.verticalAlign = "middle";

        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.appendChild(bookmarkButton);

        bookmarkButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            addNewBookmarkHandler();
        });

        console.log("Bookmark button injected");
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

injectBookmarkButton();


// ================== BOOKMARK LOGIC ==================

async function addNewBookmarkHandler() {
    const currentBookmarks = await getCurrentBookmarks();

    const url = window.location.href;
    const id = extractLeetCodeSlug(url);

    if (!id) {
        console.error("Slug extraction failed");
        return;
    }

    const titleEl =
        document.querySelector("h4") ||
        document.querySelector(".text-title-large");

    const name = titleEl ? titleEl.innerText.trim() : "LeetCode Problem";

    if (currentBookmarks.some(b => b.id === id)) {
        console.log("Already bookmarked");
        return;
    }

    const updated = [...currentBookmarks, { id, name, url }];

    chrome.storage.sync.set(
        { [leetcode_problem_key]: updated },
        () => console.log("Bookmark saved")
    );
}

function extractLeetCodeSlug(url) {
    const key = "/problems/";
    const start = url.indexOf(key);
    if (start === -1) return null;

    const slugStart = start + key.length;
    const q = url.indexOf("?", slugStart);
    const slug = q === -1 ? url.slice(slugStart) : url.slice(slugStart, q);

    return slug.endsWith("/") ? slug.slice(0, -1) : slug;
}

function getCurrentBookmarks() {
    return new Promise(resolve => {
        chrome.storage.sync.get([leetcode_problem_key], res => {
            resolve(res[leetcode_problem_key] || []);
        });
    });
}
