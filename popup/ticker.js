"use strict";

setTimeout(init, 500);

var ticker;

///////////////////////////////////
//INITIAL
//////////////////////////////////
function init() {
    ticker = {
        data: [],
        favourites: [],
        pageNumbers: [1, 1],
        view: 1,
        limit: 500,
        currency: "USD",
        theme: new darktheme(),
        currencies: {
            USD: "$",
            EUR: "€",
            AUD: "$A",
            GBP: "£",
            BTC: "₿"
        },
        currenciePriceStrings: {
            USD: "price_usd",
            EUR: "price_eur",
            AUD: "price_aud",
            GBP: "price_gbp",
            BTC: "price_btc"
        },

        volumeString_24h: {
            USD: "24h_volume_usd",
            EUR: "24h_volume_eur",
            AUD: "24h_volume_aud",
            GBP: "24h_volume_gbp",
            BTC: "24h_volume_btc"
        },
        getPageNumber: function(){
            if(this.view == 1){
                return this.pageNumbers[0];
            } else {
                return this.pageNumbers[1];
            }
        },
        setPageNumber: function(number){
            if(this.view == 1){
                this.pageNumbers[0] = number;
            } else {
                this.pageNumbers[1] = number;
            }
        },
        getData: function(){
            if(this.view == 1){
                return this.data;
            } else {
                return this.favourites;
            }
        },
        setData: function(input){
            if(this.view == 1){
                this.data = input;
            } else {
                this.favourites = input;
            }
        }
    };

    //Set up event Handler
    $("#nextPage").on("click", nextPage);

    $("#prevPage").on("click", previousPage);

    $("#updateBtn").on("click", function () {
        updateData();
    });

    $('#firsttab').on("click", function (e) {
        ticker.view = 1;
        saveOption("view", ticker.view);
        $(this).removeClass("inactive");
        $("#secondtab").addClass("inactive");
        buildTable();
        updateTable((ticker.getPageNumber()-1)*10);

    });
    $('#secondtab').on("click", function (e) {
        ticker.view = 2;
        saveOption("view", ticker.view);
        $(this).removeClass("inactive");
        $("#firsttab").addClass("inactive");
        buildTable();
        updateTable((ticker.getPageNumber()-1)*10);
    });

    $("#currencieList").on("change", function () {
        ticker.currency = $(this).val();
        saveOption("currencie", ticker.currency);
        updateData();
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
        //popout();
    });
    restoreFavourites();
    //Get Data intially
    restoreOptions();
    $.getJSON("https://api.coinmarketcap.com/v1/ticker/?convert=" + ticker.currency + "&limit=" + ticker.limit, function (res) {
        ticker.setData(res);
        //If you want to renew icons set ticker.limit to 500
        //         for(var i = 0; i < res.length; i++){
        //             console.log('wget "https://files.coinmarketcap.com/static/img/coins/32x32/' + res[i].id + '.png"');
        //         }

        //Show and Hide Elements when API has finished loading
        buildWindow();
        buildTable();
        if (ticker.getPageNumber() === 1) {
            updateTable(0, res);
        } else {
            updateTable((ticker.getPageNumber() - 1) * 10, res);
        }

        var tempStrings = window.localStorage.getItem("fav").split(" ");
        for(var j = 0; j < tempStrings.length; j++){
            for(var k = 0; k < ticker.data.length; k++){
                if(ticker.data[k].id == tempStrings[j]){
                    ticker.favourites.push(ticker.data[k]);
                }
            }
        }
    });
}

function saveOption(name, value) {
    window.localStorage.setItem(name, value);
}
function restoreFavourites(){
    if(window.localStorage.getItem("fav") === null){
        saveOption("fav", "");
    }
}

function restoreOptions() {
    var curr = window.localStorage.getItem("currencie"),
        page = window.localStorage.getItem("pageNumber"),
        settingsOn = window.localStorage.getItem("settingsEnabled"),
        themeEnabled = window.localStorage.getItem("themeEnabled"),
        view = window.localStorage.getItem("view");

    // if (view != undefined) ticker.view = parseInt(view);


    //Set Currency
    if (curr != undefined) ticker.currency = curr;
    $("#currencieList").val(ticker.currency);

    if (page != undefined) ticker.setPageNumber(parseInt(page));
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
    var row, rows;
    if (ticker.view == 1) {
        rows = 10;
    } else if (ticker.view == 2) {
        if(ticker.favourites.length < 10){
            rows = ticker.favourites.length % 10;
        } else {
            var temp = ticker.favourites.length;
            for(var j = 1; j < ticker.getPageNumber(); j++){
                temp -= 10;
            }
            if(temp > 10){
                temp = 10;
            }
            rows = temp;
        }
    }

    $(".row").remove();

    for (var i = 0; i < rows; i++) {
        //Every second row has a different color
        if (i % 2 == 0) {
            row = $("<tr>").addClass("altcoin").addClass("row").appendTo($("table"));
        } else {
            row = $("<tr>").addClass("altcoin").addClass("even").addClass("row").appendTo($("table"));
        }
        //Cells and their values
        var rankcell = $("<td>").addClass("rank").appendTo(row),
            logocell = $("<td>").addClass("logo").appendTo(row),
            namecell = $("<td>").addClass("name").appendTo(row),
            pricecell = $("<td>").addClass("price").appendTo(row),
            changescell = $("<td>").addClass("changes").appendTo(row),
            addcell,
            minuscell;

        if(ticker.view == 1){
            addcell = $("<td>").addClass("add").appendTo(row);
        } else {
            minuscell = $("<td>").addClass("minus").appendTo(row);
        }

        rankcell.on("click", function (e) {
            goTo(e);
        });

        logocell.on("click", function (e) {
            goTo(e);
        });

        namecell.on("click", function (e) {
            goTo(e);
        });

        pricecell.on("click", function (e) {
            goTo(e);
        });

        changescell.on("click", function (e) {
            goTo(e);
        });

        if(addcell){
            addcell.on("click", function (e) {
                addToFavourites(e);
            });
            addcell.on("mousedown", function(e){
                $(this).toggleClass("inactive");
            });
            addcell.on("mouseup", function(e){
                $(this).toggleClass("inactive");
            })
        }

        if(minuscell){
            minuscell.on("click", function (e) {
                removeFromFavourites(e);
            });
        }
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
    $("#tabsrow").show();
    if ($("#toggleSettings").prop("checked")) $(".settings").show();

    //Page Navigator
    $("#pages").css("display", "inline-block");
    $("#pageNumber").text(ticker.getPageNumber());
    $("#prevPage").css("color", "gray");
}

//////////////////////////////////
//CORE FUNCTIONS
//////////////////////////////////


function updateTable(j) {

    j = j ? j : 0;

    var updatedData;

    if (ticker.view == 1) {
        updatedData = ticker.data;
    } else if (ticker.view == 2) {
        updatedData = ticker.favourites;
    }
    handleTheme(ticker.theme.getStatus());

    $("#pageNumber").text(ticker.getPageNumber());

    $.each($("td.rank"), function (i, rankEl) {
        i += j;
        $(rankEl).text(updatedData[i].rank);
    });
    $.each($("td.logo"), function (i, logoEl) {
        i += j;
        $(logoEl).css("background-image", getImageUrl(updatedData[i].id));
    });
    $.each($("td.name"), function (i, nameEl) {
        i += j;
        $(nameEl).text(updatedData[i].name);
    });
    $.each($("td.price"), function (i, priceEl) {
        i += j;
        $(priceEl).text(getFormattedPrice(updatedData[i]));
    });
    $.each($("td.changes"), function (i, changesEl) {
        i += j;
        $(changesEl).text(getFormattedChange(updatedData[i], changesEl));
    });
    $.each($("td.add"), function (i, addEl) {
        $(addEl).text("+");
    });
    $.each($("td.minus"), function (i, minusEl) {
        $(minusEl).text("-");
    });
}

function updateData() {
    overlay(true);
    $.getJSON("https://api.coinmarketcap.com/v1/ticker/?convert=" + ticker.currency + "&limit=" + ticker.limit, function (res) {
        ticker.data = res;

        for(var i = 0; i < ticker.favourites.length; i++){
            if($.inArray(ticker.favourites[i], ticker.data !== -1)) {
                ticker.favourites[i] = ticker.data[ticker.favourites[i].rank - 1];
            }
        }

        updateTable((ticker.getPageNumber - 1) * 10);

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
    var usedData;

    if(ticker.view == 1){
        usedData = ticker.data;
    } else {
        usedData = ticker.favourites;
    }
    if (ticker.getPageNumber() < 10 && ticker.getPageNumber()*10 < usedData.length) {
        ticker.setPageNumber(ticker.getPageNumber()+1);
        buildTable();
        updateTable((ticker.getPageNumber()-1) * 10);
        saveOption("pageNumber", ticker.getPageNumber());
        if (ticker.getPageNumber() == 10) {
            $("#nextPage").css("color", "gray");
        } else {
            $("#prevPage").css("color", "black");
        }
    }
}

function previousPage() {
    if (ticker.getPageNumber() > 1) {
        ticker.setPageNumber(ticker.getPageNumber()-1);
        buildTable();
        updateTable((ticker.getPageNumber() - 1) * 10);
        saveOption("pageNumber", ticker.getPageNumber());
        if (ticker.getPageNumber() == 1) {
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
        ticker.theme.apply();
    } else {
        ticker.theme.revert();
    }
}

function goTo(e) {
    var elements = document.getElementsByClassName(e.target.className),
        array = [].slice.call(elements),
        index = array.indexOf(e.target) + (10 * (ticker.getPageNumber() - 1));

    if(ticker.view == 1) {
        window.open("https://coinmarketcap.com/currencies/" + ticker.data[index].id + "/");
    } else {
        var tempRank = parseInt($(e.target).siblings().filter(':first-child').text());
        window.open("https://coinmarketcap.com/currencies/" + ticker.data[tempRank-1].id + "/");
    }
}

function addToFavourites(e) {
    var elements, array, index;
    elements = document.getElementsByClassName(e.target.className);
    array = [].slice.call(elements);
    index = array.indexOf(e.target) + (10 * (ticker.getPageNumber() - 1));

    if ($.inArray(ticker.data[index], ticker.favourites) !== -1) {
    } else {
        ticker.favourites.push(ticker.data[index]);

        var favString = window.localStorage.getItem("fav");
        favString += ticker.data[index].id + " ";
        saveOption("fav", favString);
    }
}

function removeFromFavourites(e) {
    var elements = document.getElementsByClassName(e.target.className),
        array = [].slice.call(elements),
        index = array.indexOf(e.target) + (10 * (ticker.getPageNumber() - 1));

    ticker.favourites.splice(index, 1);

    var favString = window.localStorage.getItem("fav");

    var tempRank = parseInt($(e.target).siblings().filter(':first-child').text());
    for(var i = 0; i < ticker.data.length; i++){
        if(ticker.data[i].rank == tempRank){
            favString = favString.replace(ticker.data[i].id + " ", "");
            window.localStorage.setItem("fav", favString);
            break;
        }
    }

    buildTable();
    updateTable((ticker.getPageNumber()-1)*10);
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
    var value = parseFloat(element[ticker.currenciePriceStrings[ticker.currency]]),
        rounded = value.toFixed(4),
        symbol = ticker.currencies[ticker.currency];

    if (ticker.currency == "BTC") {
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
