var itemsPerPage = 40;
var currentPage = 1;
var data = [];
var popup = null;
function openSettings() {
    var popup = document.createElement('div');
    popup.innerHTML = "\n        <div class=\"popupContent\">\n            <label for=\"fname\">Waifus per page:</label><br>\n            <input type=\"text\" id=\"waifuPerPage\" name=\"waifuPerPage\" style=\"text-align: center;\" value=\"40\"><br>\n            <input type=\"submit\" id=\"waifuPerPageButton\" value=\"Submit\">\n        </div>";
    popup.className = 'popup';
    document.body.appendChild(popup);
    var input = document.getElementById('waifuPerPage');
    var submitButton = popup.querySelector('input[type="submit"]');
    if (!input || !submitButton) {
        console.error("Input or submit button not found.");
        return;
    }
    submitButton.addEventListener('click', function () {
        var value = parseInt(input.value);
        if (isNaN(value) || value <= 0) {
            alert("Please enter a valid number greater than 0.");
            return;
        }
        itemsPerPage = value;
        currentPage = 1; // Reset to first page
        displayPage();
        document.body.removeChild(popup);
    });
    popup.addEventListener('click', function (event) {
        if (event.target === popup) {
            document.body.removeChild(popup);
        }
    });
}
function correctSizes() {
    var cards = document.querySelectorAll('div.waifucard');
    Array.from(cards).forEach(function (element) {
        if (!(element instanceof HTMLElement))
            return;
        var url = element.style.backgroundImage.slice(5, element.style.backgroundImage.length - 2);
        var image = new Image();
        image.src = url;
        image.onload = function () {
            element.style.width = "".concat((image.width / image.height) * 300, "px");
            element.style.height = "300px";
            element.classList.add('loaded');
        };
    });
}
function clearRow() {
    var rows = document.querySelectorAll('.waifurow');
    Array.from(rows).forEach(function (row) {
        row.innerHTML = '';
    });
}
function displayPage() {
    var row = document.querySelector('.waifurow');
    if (!(row instanceof HTMLElement))
        return;
    clearRow();
    var startIndex = (currentPage - 1) * itemsPerPage;
    var endIndex = startIndex + itemsPerPage;
    var _loop_1 = function (i) {
        var waifu = data[i];
        var image = new Image();
        image.src = waifu.imageURL;
        var card = document.createElement('div');
        card.className = waifu.class;
        card.style.backgroundImage = "url(".concat(waifu.imageURL, ")");
        card.style.backgroundSize = 'cover';
        card.innerHTML = "\n            <div class=\"waifudetails\">\n                <p>".concat(waifu.rating, "</p>\n            </div>\n        ");
        row.appendChild(card);
        image.onload = function () {
            card.style.width = "".concat((image.width / image.height) * 300, "px");
            card.style.height = '300px';
        };
    };
    for (var i = startIndex; i < endIndex && i < data.length; i++) {
        _loop_1(i);
    }
    updatePageNumber();
    correctSizes();
}
function updatePageNumber() {
    var pageNumberElement = document.getElementById('pageNumber');
    if (pageNumberElement) {
        pageNumberElement.textContent = "Page ".concat(currentPage, " of ").concat(Math.ceil(data.length / itemsPerPage));
    }
}
setTimeout(function () {
    var loadedData = document.getElementById('data');
    var prevButton = document.getElementById('previousPage');
    var nextButton = document.getElementById('nextPage');
    if (!(prevButton && nextButton))
        return;
    if (!loadedData) {
        console.error("Data element not found.");
        return;
    }
    data = JSON.parse(loadedData.textContent);
    correctSizes();
    displayPage();
    openSettings();
    prevButton.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            displayPage();
        }
    });
    nextButton.addEventListener('click', function () {
        if (currentPage * itemsPerPage < data.length) {
            currentPage++;
            displayPage();
        }
    });
}, 1);
var observer = new MutationObserver(function () {
    correctSizes();
});
observer.observe(document.body, { childList: true });
