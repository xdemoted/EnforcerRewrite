var itemsPerPage = 40;
var currentPage = 1;
var data: { imageURL: string, class: string, rating: string }[] = [];
var popup: null | Element = null;

function openSettings() {
    let popup = document.createElement('div');
    popup.innerHTML = `
        <div class="popupContent">
            <label for="fname">Waifus per page:</label><br>
            <input type="text" id="waifuPerPage" name="waifuPerPage" style="text-align: center;" value="40"><br>
            <input type="submit" id="waifuPerPageButton" value="Submit">
        </div>`
    popup.className = 'popup';
    document.body.appendChild(popup);

    const input = document.getElementById('waifuPerPage') as HTMLInputElement;
    const submitButton = popup.querySelector('input[type="submit"]') as HTMLInputElement

    if (!input || !submitButton) {
        console.error("Input or submit button not found.");
        return;
    }

    submitButton.addEventListener('click', function () {
        const value = parseInt(input.value);
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
    const cards = document.querySelectorAll('div.waifucard');

    Array.from(cards).forEach(element => {
        if (!(element instanceof HTMLElement)) return;
        const url = element.style.backgroundImage.slice(5, element.style.backgroundImage.length - 2);
        const image = new Image();
        image.src = url;
        image.onload = function () {
            element.style.width = `${(image.width / image.height) * 300}px`;
            element.style.height = `300px`;
            element.classList.add('loaded');
        };
    });
}

function clearRow() {
    const rows = document.querySelectorAll('.waifurow');
    Array.from(rows).forEach(row => {
        row.innerHTML = '';
    });
}

function displayPage() {
    const row = document.querySelector('.waifurow');

    if (!(row instanceof HTMLElement)) return;

    clearRow();

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    for (let i = startIndex; i < endIndex && i < data.length; i++) {
        const waifu = data[i];
        const image = new Image();
        image.src = waifu.imageURL;
        const card = document.createElement('div');
        card.className = waifu.class;
        card.style.backgroundImage = `url(${waifu.imageURL})`;
        card.style.backgroundSize = 'cover';
        card.innerHTML = `
            <div class="waifudetails">
                <p>${waifu.rating}</p>
            </div>
        `;
        row.appendChild(card);

        image.onload = function () {
            card.style.width = `${(image.width / image.height) * 300}px`;
            card.style.height = '300px';
        }
    }

    updatePageNumber();
    correctSizes();
}

function updatePageNumber() {
    const pageNumberElement = document.getElementById('pageNumber');
    if (pageNumberElement) {
        pageNumberElement.textContent = `Page ${currentPage} of ${Math.ceil(data.length / itemsPerPage)}`;
    }
}

setTimeout(() => {
    const loadedData = document.getElementById('data');
    const prevButton = document.getElementById('previousPage');
    const nextButton = document.getElementById('nextPage');

    if (!(prevButton && nextButton)) return;
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

var observer = new MutationObserver(() => {
    correctSizes();

});

observer.observe(document.body, { childList: true });