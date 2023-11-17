spreadsheetId = "1Ap8RnCL-HDkcXE8BFlB6s7EBrVK1fQwqGoJHbgEFXnM";
isFirstTime = true;

titles = [];
items = [];
isLoading = false;
title = "";
search = "";

document.addEventListener("DOMContentLoaded", async function() {
    const search = document.getElementById("search");
    search.addEventListener("input", function(event) {
        this.search = event.target.value;
        updateUrl();
    }.bind(window));

    const params = new URLSearchParams(window.location.search);
    if (params) {
        const titleParam = params.get("page");
        if (titleParam) {
            this.title = titleParam;
        }

        const searchParam = params.get("search");
        if (searchParam) {
            this.search = searchParam;
            console.log(this.search);
        }
    }

    gapi.load("client", onLoaded.bind(window));
}.bind(window));

async function onLoaded() {
    await gapi.client.init({
        apiKey: atob("QUl6YVN5RGgwdUNHbmIwTVg0WVJ2aUJSRzVxVjVySll6VDZjZGZj"),
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    });

    try {
        let response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: this.spreadsheetId,
            fields: "sheets(properties(title))",
        });
            
        this.titles = response.result.sheets.map(x => x.properties.title).slice(2);
    } catch (error) {
        this.titles = [ formatError(error) ];
    }

    renderTitles();
}

function renderTitles() {
    const menuItemsList = document.getElementById("menuItemsList");
    animateOpacityIn(menuItemsList);

    const hasRequestedPage = !isNullOrWhiteSpace(this.title) && this.titles.includes(this.title);
    for (let i = 0; i < this.titles.length; i++) {
        const title = this.titles[i];
        const li = document.createElement("li");
        li.addEventListener("click", onNavClick.bind(window));
        const content = document.createTextNode(title);
        const a = document.createElement("a");
        a.setAttribute("href", "#");
        li.appendChild(a);
        a.appendChild(content);
        menuItemsList.appendChild(li);
        
        const isFirst = !hasRequestedPage && i == 0;
        const isRequested = hasRequestedPage && this.title == title;

        if (isFirst || isRequested) {
            li.click();
        }
    }
    
    animateSlideIn(menuItemsList, true);
}

async function onNavClick(event) {
    this.title = event.currentTarget.children[0].innerText;
    if (this.isLoading) {
        return;
    }
    const menuItemsList = document.getElementById("menuItemsList");
    const footer = document.getElementById("footer");
    const search = document.getElementById("search");
    const about = document.getElementById("about");
    
    // Loading
    this.isLoading = true;
    menuItemsList.style.opacity = 0.75;
    menuItemsList.style.filter = "grayscale(75%)";
    about.style.display = "none";
    search.style.display = "none";
    
    updateUrl();

    var actives = document.getElementsByClassName("active");
    for (let i = 0; i < actives.length; i++) {
        const active = actives[i];
        active.setAttribute("class", "");   
    }
    event.currentTarget.setAttribute("class", "active");
    const infoItemList = document.getElementById("infoItemList");
    infoItemList.innerHTML = "";
    await loadData();
    
    // Loaded
    this.isLoading = false;
    menuItemsList.style.opacity = 1;
    menuItemsList.style.filter = "grayscale(0%)";
    about.style.display = "inline-block";
    search.style.display = "inline-block";
    if (this.isFirstTime) {
        search.value = this.search;
        this.listjs.search(search.value);
    } else {
        search.value = "";
    }
    animateSlideIn(footer, false);

    this.isFirstTime = false;
}

async function loadData() {
    this.items = [];
    try {
        let response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range: this.title + "!A1:Z1000",
        });
        let values = response.result.values;
        const headerSearchLimit = 4;
        const headerMinimumLength= 4;
        
        let headerRow = new Array();
        for (var attempt = 0; attempt < headerSearchLimit; attempt++) {
            if (headerRow.length < 4) {
                values.shift();
                headerRow = values[0];
            } else break;
        }
        
        if (headerRow.length < 4) {
            console.log("Header is too short");
        } else {
            for (var y = 1; y < values.length; y++) {
                let row = values[y];
                if (row.length < 4) {
                    console.log("Line is too short");
                } else {
                    var subcategory = row[2];
                    var title = row[3];
                    if (isNullOrWhiteSpace(title)) {            
                        title = subcategory;
                        subcategory = "";
                    }
                    var data = [];
                    for (var x = 4; x < headerRow.length; x++)
                    {
                        const header = headerRow[x];
                        if (x < row.length && !isNullOrWhiteSpace(row[x]))
                        {
                            const value = row[x];
                            const dataItem = {
                                title: header,
                                value: value
                            };
                            data.push(dataItem);
                        }
                    }
                    var item = {
                        title: title,
                        subcategory: subcategory,
                        data: data
                    };
                    this.items.push(item);
                }
            }
        }
    }
    catch (error) {
        this.items.push({
            title: "",
            subcategory: "",
            data: [{
                title: "Ошибка",
                value: formatError(error)
            }]
        });
    }
    renderItems();
}

function renderItems() {
    const infoItemList = document.getElementById("infoItemList");
    animateOpacityIn(infoItemList);

    for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        const li = document.createElement("li");
        li.setAttribute("class", "item list-group-item");
        // Title
        const h2 = document.createElement("h2");
        h2.setAttribute("class", "itemTitle");
        const titleContent = document.createTextNode(item.title);
        h2.appendChild(titleContent);
        li.appendChild(h2);
        // Subcategory
        const h4 = document.createElement("h4");
        h4.setAttribute("class", "itemSubcategory");
        const subcategoryContent = document.createTextNode(item.subcategory);
        h4.appendChild(subcategoryContent);
        li.appendChild(h4);
        // Data
        const div = document.createElement("div");
        div.setAttribute("class", "itemData");
        for (let j = 0; j < item.data.length; j++) {
            const prop = item.data[j];
            const p = document.createElement("p");
            p.setAttribute("class", "prop");
            const b = document.createElement("b");
            const bContent = document.createTextNode(prop.title + ": ");
            b.appendChild(bContent);
            p.appendChild(b);
            p.appendChild(formatValue(prop.value));
            div.appendChild(p);            
        }
        li.appendChild(div);
        infoItemList.appendChild(li);
    }

    // Generate table
    var options = {
        valueNames: [ "itemTitle", "itemSubcategory", "itemData" ]
    };
    if (this.listjs) {
        this.listjs.reIndex();
    } else {
        this.listjs = new List("root", options);
    }
}

function animateOpacityIn(element) {
    element.animate([
        { opacity: 0, },
        { opacity: 1 }
      ], {
        duration: 250,
        easing: "ease-in-out"
      });
}

function animateSlideIn(element, direction) {    
    let from = element.clientHeight;
    if (direction) {
        from *= -1;
    }
    element.animate([
        { transform: "translate(0px, " + from + "px)" },
        { transform: "translate(0px, 0px)" }
      ], {
        duration: 250,
        easing: "ease-in-out"
      });
      // iOS bug: https://stackoverflow.com/a/66103417/1876990
      setTimeout(250, () => {
        element.style.display = "table";
        element.offsetHeight;
        element.style.display = "block";
      });
}

function formatValue(value) {
    value = value.toString();
    function short(value) {
        if (value.length > 40) {
            value = value.substring(0, 37) + "...";
        }
        return value;
    }
    if (value.startsWith("http")) {
        const a = document.createElement("a");
        a.setAttribute("href", value);
        a.setAttribute("class", "link")
        const content = document.createTextNode(short(value));
        a.appendChild(content);
        return a;
    }
    if (value.startsWith("+3")) {
        const a = document.createElement("a");
        a.setAttribute("href", "tel:"+value);
        a.setAttribute("class", "link")
        const content = document.createTextNode(short(value));
        a.appendChild(content);
        return a;
    }
    return document.createTextNode(value);
}

function formatError(error) {
    let output = "";
    if (error.body && error.result) error = error.result.error;
    if (error.message) output += error.message + "\r\n";
    if (error.stack) output += error.stack + "\r\n";
    return output;
}

function updateUrl() {
    let url = `?page=${this.title}`;
    if (!isNullOrWhiteSpace(this.search)) {
        url += `&search=${this.search}`;
    }
    history.pushState(null, null, url);
}

function isNullOrWhiteSpace(string) {
    return !string || string == "" || string == " ";
}
