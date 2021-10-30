const $controlToggle = document.getElementById("control-toggle");
const $controls = document.getElementById("controls");
const $close = document.getElementById("close");
const $container = document.getElementsByClassName("container")[0];
const $themes = document.getElementById("themes").getElementsByTagName("button");
const $fontSize = document.getElementById("font-size");
const $fontSizeButtons = $fontSize.getElementsByTagName("button");
const $fontSizeValue = $fontSize.getElementsByTagName("span")[0];
const $lineHeight = document.getElementById("line-height");
const $lineHeightButtons = $lineHeight.getElementsByTagName("button");
const $lineHeightValue = $lineHeight.getElementsByTagName("span")[0];
const $contentWidth = document.getElementById("content-width");
const $contentWidthButtons = $contentWidth.getElementsByTagName("button");
const $contentWidthValue = $contentWidth.getElementsByTagName("span")[0];

const properties = {
    "themes": [localStorage.getItem("themes") || "light"],
    "font-size": [getPropertyValue("font-size"), 1, 9, 40],
    "line-height": [getPropertyValue("line-height") / 16, .1, 1, 2.4],
    "content-width": [getPropertyValue("max-width", $container) / 16, 5, 35]
};
const fns = {
    "themes": function (theme = properties["themes"][0]) {
        document.body.className = `theme-${theme}`;
    },
    "font-size": function (fontSize = properties["font-size"][0]) {
        document.body.style.fontSize = `${fontSize}px`;
        $fontSizeValue.innerText = `${fontSize}px`;
    },
    "line-height": function (lineHeight = properties["line-height"][0]) {
        document.body.style.lineHeight = `${lineHeight}`;
        $lineHeightValue.innerText = `${lineHeight}`;
    },
    "content-width": function (contentWidth = properties["content-width"][0]) {
        $container.style.maxWidth = `${contentWidth}em`;
        $contentWidthValue.innerText = `${contentWidth}`;
    }
};


/* Event listeners */
for (let i = 0; i < $themes.length; i++) {
    $themes[i].addEventListener("click", adjustStyle);
}

$controlToggle.addEventListener("click", toggleControls);
$close.addEventListener("click", toggleControls);
$fontSizeButtons[0].addEventListener("click", adjustStyle);
$fontSizeButtons[1].addEventListener("click", adjustStyle);
$lineHeightButtons[0].addEventListener("click", adjustStyle);
$lineHeightButtons[1].addEventListener("click", adjustStyle);
$contentWidthButtons[0].addEventListener("click", adjustStyle);
$contentWidthButtons[1].addEventListener("click", adjustStyle);


/* Init */
fns["themes"]();
fns["font-size"]();
fns["line-height"]();
fns["content-width"]();

/* Functions */
function getPropertyValue(property, element = document.body) {
    return +localStorage.getItem(property) || +window.getComputedStyle(element, null).getPropertyValue(property).replace(/px/, "");
}

function toggleControls(e) {
    $controls.classList.toggle("hidden");
}

function adjustStyle() {
    const operation = this.innerText;
    const category = this.parentNode.id;
    const property = properties[category];

    if (category === "themes") {
        property[0] = this.id;
    }

    if ((property[2] && property[0] === property[2] && operation === "-")
        || (property[3] && property[0] === property[3] && operation === "+")) {
        return false;
    }

    if (category !== "themes") {
        property[0] = operation === "-" ? property[0] - property[1] : property[0] + property[1];
        category === "line-height" && (property[0] = +property[0].toFixed(1));
    }

    fns[category]();
    localStorage.setItem(category, property[0]);
}