titles = [];
items = [];
isLoading = true;

document.addEventListener("DOMContentLoaded", async function() {
    gapi.load("client", onLoaded);
});

async function onLoaded() {
    await gapi.client.init({
        apiKey: atob("QUl6YVN5RGgwdUNHbmIwTVg0WVJ2aUJSRzVxVjVySll6VDZjZGZj"),
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    });

    try {
        let response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: "1BvIXzfxdg28vinrQ8PfpxfLyuaP6LGA1nETN14AMq84",
            fields: "sheets(properties(title))",
        });
            
        this.titles = response.result.sheets.map(x => x.properties.title);
    } catch (error) {
        this.titles = [ formatError(error) ];
    }

    renderTitles();
}

function renderTitles() {
    for (let i = 0; i < this.titles.length; i++) {
        const title = this.titles[i];
        const li = document.createElement("li");
        li.addEventListener("click", onNavClick);
        const content = document.createTextNode(title);
        const a = document.createElement("a");
        const menuItemsList = document.getElementById("menuItemsList");
        a.setAttribute("href", "#");
        li.appendChild(a);
        a.appendChild(content);
        menuItemsList.appendChild(li);
        
        if (i == 0) {
            li.click();
        }
    }
}

async function onNavClick(event) {
    var title = event.currentTarget.children[0].innerText;
    if (this.isLoading) {
        return;
    }
    const menuItemsList = document.getElementById("menuItemsList");
    const search = document.getElementById("search");
    
    // Loading
    this.isLoading = true;
    menuItemsList.style.opacity = 0.5;
    search.style.display = "none";
    search.value = "";

    var actives = document.getElementsByClassName("active");
    for (let i = 0; i < actives.length; i++) {
        const active = actives[i];
        active.setAttribute("class", "");   
    }
    event.currentTarget.setAttribute("class", "active");
    const infoItemList = document.getElementById("infoItemList");
    infoItemList.innerHTML = "";
    await loadData(title);
    
    // Loaded
    this.isLoading = false;
    menuItemsList.style.opacity = 1;
    search.style.display = "inline-block";
    search.value = "";
}

async function loadData(title) {
    this.items = [];
    try {
        let response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: "1BvIXzfxdg28vinrQ8PfpxfLyuaP6LGA1nETN14AMq84",
            range: title + "!A1:Z1000",
        });
        let values = response.result.values;
        let headerRow = values[0];
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

function formatValue(value) {
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
    return error.message + error.stack;
}

function isNullOrWhiteSpace(string) {
    return !string || string == "" || string == " ";
}