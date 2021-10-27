/* DOM */
const $logo = document.getElementById("logo");
const $grid = document.getElementById("grid");
const $cards = $grid.getElementsByClassName("card");
const $topNav = document.getElementById("top-nav");
const $bookTitle = document.getElementById("book-title");
const $book = document.getElementById("book");
const $back = document.getElementById("back");
const $page = document.getElementById("page");
const $prev = document.getElementById("prev");
const $next = document.getElementById("next");
const $pageNum = document.getElementById("page-num");
const $pageCount = document.getElementById("page-count");
const $downloadPage = document.getElementById("download-page");
const $downloadBook = document.getElementById("download-book");

const context = $page.getContext("2d");
const scale = 1.5;
const books = ["we-want-to-live", "the-recipe-for-living-without-disease", "benefits-of-raw-eggs-and-cheese", "questions-and-answers-2nd-edition", "questions-and-answers", "beneficial-home-baths", "early-training-with-aajonus"];
let currentBookIndex = -1;
let pdfDoc = null;
let pageRendering = false;
let pageNumberPending = null;
let currentPageNumber = getPageNumber() || 1;
pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/js/pdf.worker.js";

/* Event Listeners */
window.addEventListener("DOMContentLoaded", handleRouting);

for (let i = 0; i < $cards.length; i++) {
    let links = $cards[i].getElementsByTagName("a");

    for (let j = 0; j < links.length; j++) {
        if (links[j].innerText !== "Download") {
            links[j].addEventListener("click", selectBook);
        }
    }
}

$back.addEventListener("click", showGrid);
$prev.addEventListener("click", prevPage);
$next.addEventListener("click", nextPage);
$downloadPage.addEventListener("click", downloadPage);

// window.addEventListener("hashchange", handleHashChange);

/* Functions */
function getPageNumber() {
    const page =  window.location.hash.match(/page-(\d+)/);
    return page && page.length > 1 ? +page[1] : null;
}

function getSlug(hash) {
    const slug = hash.split("#");
    return slug.length > 1 ? slug[1].match(/[^\/]+/)[0] : "";
}

function handleRouting() {
    const book = getSlug(window.location.hash);
    currentBookIndex = books.indexOf(book);

    if (currentBookIndex > -1) {
        const $titleLinks = document.querySelectorAll(".card-title a");
        
        for (let i = 0; i < $titleLinks.length; i++) {
            if (book === getSlug($titleLinks[i].href)) {
                activeBook = $titleLinks[i].innerText;
                showBook();
                return true;
            }
        }
    }
}

function selectBook() {
    const book = getSlug(this.href);
    currentBookIndex = books.indexOf(book);

    if (currentBookIndex > -1) {
        let $element = this;

        while (!$element.classList.contains("card")) {
            $element = $element.parentNode;
        }

        activeBook = $element.querySelector(".card-title a").innerText;
        showBook();
    }
}

function changeVisibility(event, ...elements) {
    const fn = event === "show" ? "remove" : "add";
    elements.forEach(function (element) {
        element.classList[fn]("hidden")
    });
}

function showBook() {
    initializeDocument();
    changeVisibility("hide", $logo, $grid);
    changeVisibility("show", $topNav, $book);
    $bookTitle.innerText = activeBook;
    $downloadBook.href = getFilePath();
    $downloadBook.download = `${books[currentBookIndex]}.pdf`;
}

function getFilePath() {
    return `books/${books[currentBookIndex]}.pdf`;
}

function initializeDocument() {
    pdfjsLib.getDocument(getFilePath()).promise
        .then(function (pdf) {
            pdfDoc = pdf;
            $pageCount.textContent = pdf.numPages;
            renderPage(currentPageNumber);
        });
}

function renderPage(pageNumber) {
    pageRendering = true;

    if (pageNumber > pdfDoc.numPages) {
        pageNumber = pdfDoc.numPages;
    }

    pdfDoc.getPage(pageNumber).then(function (page) {
        const viewport = page.getViewport({ scale });
        const renderCtx = {
            canvasContext: context,
            viewport
        };
        $page.height = viewport.height;
        $page.width = viewport.width;

        page.render(renderCtx).promise.then(function () {
            pageRendering = false;

            if (pageNumberPending !== null) {
                renderPage(pageNumberPending);
                pageNumberPending = null;
            }
        });
    });

    currentPageNumber = pageNumber;
    $pageNum.textContent = pageNumber;
    location.hash = `#/${books[currentBookIndex]}/page-${pageNumber}`;
}

function queueRenderPage(pageNumber) {
    if (pageRendering) {
        pageNumberPending = pageNumber;
    } else {
        renderPage(pageNumber);
    }
}

function prevPage() {
    if (currentPageNumber <= 1) {
        return;
    }

    currentPageNumber--;
    queueRenderPage(currentPageNumber);
}

function nextPage() {
    if (currentPageNumber >= pdfDoc.numPages) {
        return;
    }

    currentPageNumber++;
    queueRenderPage(currentPageNumber);
}

function resetCanvas() {
    page.width = 0;
    page.height = 0;
}

function showGrid(e) {
    e.preventDefault();
    resetCanvas();
    changeVisibility("hide", $topNav, $book);
    changeVisibility("show", $logo, $grid);
    pdfDoc = null;
    currentPageNumber = 1;
    window.location.hash = "";
}

function downloadPage() {
    const a = document.createElement("a");
    a.href = $page.toDataURL("image/png");
    a.download = `${books[currentBookIndex]}-page-${currentPageNumber}.png`;
    changeVisibility("hide", a);
    document.body.appendChild(a);
    a.click();
    a.remove();
}
