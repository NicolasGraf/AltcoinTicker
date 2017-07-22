//No more than 10 per minute = every 6 seconds
setTimeout(init, 500);

var data;

///////////////////////////////////
//INITIAL
//////////////////////////////////
function init() {
    pageNumber = 1,
        currency = "USD",
        theme = new darktheme();
    var limit = 500;

    currencies = {
        USD: "$",
        EUR: "€",
        AUD: "$A",
        GBP: "£",
        BTC: "₿"
    }
    currenciePriceStrings = {
        USD: "price_usd",
        EUR: "price_eur",
        AUD: "price_aud",
        GBP: "price_gbp",
        BTC: "price_btc"
    }

    volumeString_24h = {
        USD: "24h_volume_usd",
        EUR: "24h_volume_eur",
        AUD: "24h_volume_aud",
        GBP: "24h_volume_gbp",
        BTC: "24h_volume_btc"
    }

    $("#nextPage").on("click", nextPage);

    $("#prevPage").on("click", previousPage);

    $("#updateBtn").on("click", function () {
        updateData(limit);
    });

    $("#currencieList").on("change", function () {
        currency = $(this).val();
        saveOption("currencie", currency);
        updateData(limit);
    });

    $("#toggleSettings").on("change", function (e) {
        showSettings(e.target.checked);
        saveOption("settingsEnabled", e.target.checked);
    });

    $("#toggleTheme").on("change", function (e) {
        handleTheme(e.target.checked);
        saveOption("themeEnabled", e.target.checked);
    });

    $("#popout").on("click", function () {
        $("body").css("width", "");
        popout();
    });

    //Get Data intially
    restoreOptions();
    $.getJSON("https://api.coinmarketcap.com/v1/ticker/?convert=" + currency + "&limit=" + limit, function (res) {
        data = res;
        //If you want to renew icons
/*        for(var i = 0; i < res.length; i++){
            console.log('wget "https://files.coinmarketcap.com/static/img/coins/32x32/' + res[i].id + '.png');
        }*/
        //Show and Hide Elements when API has finished loading
        buildWindow();
        buildTable();
        if(pageNumber == 1){
            updateTable(0, res);
        } else {
            updateTable((pageNumber-1)*10, res);
        }
    });
}

function saveOption(name, value) {
    window.localStorage.setItem(name, value);
}

function restoreOptions() {
    var curr = window.localStorage.getItem("currencie"),
        page = window.localStorage.getItem("pageNumber"),
        settingsOn = window.localStorage.getItem("settingsEnabled"),
        themeEnabled = window.localStorage.getItem("themeEnabled");

    //Set Currency
    if (curr != undefined) currency = curr;
    $("#currencieList").val(currency);

    if(page != undefined) pageNumber = parseInt(page);
    $("#pageNumber").text(page);

    if (settingsOn == true || settingsOn == "true") {
        $("#toggleSettings").prop("checked", true);
    } else if (settingsOn == false || settingsOn == "false") {
        $("#toggleSettings").prop("checked", false);
    }

    if (themeEnabled == true || themeEnabled == "true") {
        $("#toggleTheme").prop("checked", true);
        handleTheme(true);
    } else if (themeEnabled == false || themeEnabled == "false") {
        $("#toggleTheme").prop("checked", false);
        handleTheme(false);
    }


}

function buildTable() {
    for (var i = 0; i < 10; i++) {
        //Every second row has a different color
        if (i % 2 == 0) {
            var row = $("<tr>").addClass("altcoin").addClass("row").appendTo($("table"));
        } else {
            var row = $("<tr>").addClass("altcoin").addClass("even").addClass("row").appendTo($("table"));
        }
        //Link to the website on the row
        row.on("click", function (e) {
            goTo(e);
        });

        //Cells and their values
        var rankcell = $("<td>").addClass("rank").appendTo(row),
            logocell = $("<td>").addClass("logo").appendTo(row),
            namecell = $("<td>").addClass("name").appendTo(row),
            pricecell = $("<td>").addClass("price").appendTo(row),
            changescell = $("<td>").addClass("changes").appendTo(row);
    }
}

function buildWindow() {
    //Hide Spinner
    $("div.loader").hide();

    //Settings Area
    $("#toggleLabel").show();
    $("#toggleSettings").show();
    $("#timestampLabel").text(getTime());

    //Table header
    $("#firstrow").show();
    if ($("#toggleSettings").prop("checked")) $(".settings").show();

    //Page Navigator
    $("#pages").css("display", "inline-block");
    $("#pageNumber").text(pageNumber);
    $("#prevPage").css("color", "gray");
}

//////////////////////////////////
//CORE FUNCTIONS
//////////////////////////////////


function updateTable(j, data) {

    j = j ? j : 0;

    handleTheme(theme.getStatus());
    $("#pageNumber").text(pageNumber);

    $.each($("td.rank"), function (i, rank) {
        i += j;
        $(rank).text(data[i].rank);
    });
    $.each($("td.logo"), function (i, logo) {
        i += j;
        $(logo).css("background-image", getImageUrl(data[i].id));
    });
    $.each($("td.name"), function (i, name) {
        i += j;
        $(name).text(data[i].name);
    });
    $.each($("td.price"), function (i, price) {
        i += j;
        $(price).text(getFormattedPrice(data[i]));
    });
    $.each($("td.changes"), function (i, changes) {
        i += j;
        $(changes).text(getFormattedChange(data[i], changes));
    });
}

function updateData(limit) {
    overlay(true);
    $.getJSON("https://api.coinmarketcap.com/v1/ticker/?convert=" + currency + "&limit=" + limit, function (res) {
        data = res;

        updateTable((pageNumber - 1) * 10, data);

        $("#timestampLabel").text(getTime());
        disableElementForSeconds($("#updateBtn"), 10);
        disableElementForSeconds($("#currencieList"), 2);

        overlay(false);
    });
}

//////////////////////////////////
//EVENT HANDLER
//////////////////////////////////
function nextPage() {
    if (pageNumber < 10) {
        updateTable((pageNumber) * 10, data);
        pageNumber++;
        $("#pageNumber").text(pageNumber);
        saveOption("pageNumber", pageNumber);
        if (pageNumber == 10) {
            $("#nextPage").css("color", "gray");
        } else {
            $("#prevPage").css("color", "black");
        }
    }
}

function previousPage() {
    if (pageNumber > 1) {
        pageNumber--;
        updateTable((pageNumber - 1) * 10, data);
        saveOption("pageNumber", pageNumber);
        $("#pageNumber").text(pageNumber);
        if (pageNumber == 1) {
            $("#prevPage").css("color", "gray");
        } else {
            $("#nextPage").css("color", "black");
        }
    }
}

function showSettings(show) {
    if (show) {
        $(".settings").show();
    } else {
        $(".settings").hide();
    }
}

/*function popout(){

 var data = {
 url: "ticker.html",
 type: "popup",
 width: 560,
 height: 600
 }
 var creating = browser.windows.create(data);
 }*/

function handleTheme(enable) {
    if (enable) {
        theme.apply();
    } else {
        theme.revert();
    }
}

function goTo(e) {
    var elements = document.getElementsByClassName(e.target.className),
        array = [].slice.call(elements),
        index = array.indexOf(e.target) + (10 * (pageNumber - 1));

    window.open("https://coinmarketcap.com/currencies/" + data[index].id + "/");
}

//////////////////////////////////
//HELPER FUNCTIONS
//////////////////////////////////
function getImageUrl(id) {
    return "url(" + "\"/icons/" + id + ".png" + "\"" + ")";
}

function getTime() {
    var timestamp = new Date(Date.now()),
        date = timestamp.toLocaleDateString(),
        time = timestamp.toLocaleTimeString();
    return date + " " + time;
}

function overlay(on) {
    if (on) {
        $("#overlay").show();
        $("#overlay").animate({
            opacity: 0.5
        }, 80);
        $("#smallLoader").show();
    } else {
        $("#overlay").animate({
            opacity: 0.5
        }, 80);
        $("#overlay").hide();
        $("#smallLoader").hide();
    }
}
function disableElementForSeconds(elem, seconds) {
    elem.attr("disabled", true);
    setTimeout(function () {
        elem.removeAttr("disabled");
    }, seconds * 1000);
}

function getFormattedPrice(element) {
    var value = parseFloat(element[currenciePriceStrings[currency]]),
        rounded = value.toFixed(4),
        symbol = currencies[currency];

    if (currency == "BTC") {
        rounded = value.toFixed(8);
    }
    return rounded + symbol;
}

function getFormattedChange(data, element) {
    if (data.percent_change_24h == null) {
        $(element).css("color", "black");
        return "/";
    } else if (parseFloat(data.percent_change_24h) >= 0) {
        $(element).css("color", "green");
        return data.percent_change_24h + "%";
    } else if (parseFloat(data.percent_change_24h) <= 0) {
        $(element).css("color", "#e45567");
        return data.percent_change_24h + "%";
    }
}
