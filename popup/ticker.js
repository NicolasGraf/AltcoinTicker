"use strict";

setTimeout(init, 500);

var ticker;

///////////////////////////////////
//INITIAL
//////////////////////////////////
function init() {
  ticker = {
    data: [],
    fullData: [], //Value of LIMIT items, so we can calculate gainers and losers,
    res: [],
    favourites: [],
    gainers_1h: [],
    gainers_24h: [],
    gainers_7d: [],
    losers_1h: [],
    losers_24h: [],
    losers_7d: [],
    pageNumbers: [1, 1, 1, 1],
    pageLimit: 10,
    view: 1,
    activeTab: '#firsttab',
    limit: 1000,
    currency: "USD",
    theme: new darktheme(),
    activePercentage: "1h",
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

    getPageNumber: function () {
      if (this.view == 1) {
        return this.pageNumbers[0];
      } else if (this.view == 2){
        return this.pageNumbers[1];
      } else if(this.view == 3){
        return this.pageNumbers[2];
      } else {
        return this.pageNumbers[3];
      }

    },
    setPageNumber: function (number) {
      if (this.view == 1) {
        this.pageNumbers[0] = number;
      } else if(this.view == 2){
        this.pageNumbers[1] = number;
      } else if(ticker.view == 3){
        this.pageNumbers[2] = number;
      } else {
        this.pageNumbers[3] = number;
      }
    },
    setGainersAndLosers: function(){
      this.gainers_1h = sortGainers(this.fullData, 100, "1h").gainerData;
      this.gainers_24h = sortGainers(this.fullData, 100, "24h").gainerData;
      this.gainers_7d = sortGainers(this.fullData, 100, "7d").gainerData;
      this.losers_1h = sortGainers(this.fullData, 100, "1h").loserData;
      this.losers_24h = sortGainers(this.fullData, 100, "24h").loserData;
      this.losers_7d = sortGainers(this.fullData, 100, "7d").loserData;
    }
  };

  //Set up event Handler
  $("#nextPage").on("click", nextPage);

  $("#prevPage").on("click", previousPage);

  $("#updateBtn").on("click", function () {
    updateData();
  });

  $('#firsttab').on("click", function (e) {
    switchTab(1, "#firsttab");
  });

  $('#secondtab').on("click", function (e) {
    switchTab(2, "#secondtab");
  });

  $('#thirdtab').on("click", function (e) {
    switchTab(3, "#thirdtab");
  });

  $('#fourthtab').on("click", function (e) {
    switchTab(4, "#fourthtab");
  });


  $("#currencieList").on("change", function () {
    ticker.currency = $(this).val();
    saveOption("currencie", ticker.currency);
    updateData();
  });

  $("#percentList").on("change", function () {
    ticker.activePercentage = $(this).val();
    $("#changeHead").text("Change (" + ticker.activePercentage + ")");
    saveOption("percent", ticker.activePercentage);
    updateData();
  });

  $("#settingsIcon").on("click", function (e) {
    $(".settings").toggle();
    saveOption("settingsEnabled", $("#settingsIcon").is(":visible"));
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
  restoreOptions();
  //Get Data intially
  $.getJSON("https://api.coinmarketcap.com/v1/ticker/?convert=" + ticker.currency + "&limit=" + ticker.limit, function (res) {
    //Comment out to renew icons
    printImageLinks(res);

    ticker.res = res.slice(0);

    var tempStrings = window.localStorage.getItem("fav").split(" ");

    for (var j = 0; j < tempStrings.length - 1; j++) {
      for (var k = 0; k < res.length; k++) {
        if (tempStrings[j] == res[k].id) {
          ticker.favourites.push(res[k]);
        }
      }
    }

    ticker.fullData = res;
    ticker.data = res.slice(0, ticker.limit * 10);
    ticker.setGainersAndLosers();

    buildWindow();

    buildTable();

    if (ticker.getPageNumber() === 1) {
      updateTable(0);
    } else {
      updateTable((ticker.getPageNumber() - 1) * 10);
    }
  });
}

function saveOption(name, value) {
  window.localStorage.setItem(name, value);
}

function restoreFavourites() {
  if (window.localStorage.getItem("fav") === null) {
    saveOption("fav", "");
  }
}

function sortGainers(unsortedData, limit, timerange){
  var swapped, gainerData, loserData;

  do {
    swapped = false;
    for (var i = 0; i < unsortedData.length-1; i++) {
      var floatValue1 = parseFloat(unsortedData[i]["percent_change_" + timerange]),
        floatValue2 = parseFloat(unsortedData[i+1]["percent_change_" + timerange]);

      if((unsortedData[i]["percent_change_" + timerange] != null) && parseFloat(unsortedData[i]["24h_volume_usd"]) >= 20000){
        if (floatValue1 < floatValue2) {
          var temp = unsortedData[i];
          unsortedData[i] = unsortedData[i+1];
          unsortedData[i+1] = temp;
          swapped = true;
        }
      } else {
        unsortedData.splice(i, 1);
        ticker.fullData.splice(i, 1);

      }
    }
  } while (swapped);

  gainerData =  unsortedData.slice(0, limit);
  loserData = unsortedData.slice(unsortedData.length - limit, unsortedData.length).reverse();

  return {
    gainerData: gainerData,
    loserData: loserData
  }
}

function savePages(){
  saveOption("pageNumber1", ticker.getPageNumber());
  saveOption("pageNumber2", ticker.getPageNumber());
  saveOption("pageNumber3", ticker.getPageNumber());
  saveOption("pageNumber4", ticker.getPageNumber());
}
function restorePages(){
  for(var i = 0; i < 4; i++){

    var item = window.localStorage.getItem("pageNumber" + (i+1).toString());
    if(item != undefined && item != null && item != "null"){
      ticker.pageNumbers[i] = parseInt(item);

    }
  }
}
function restoreOptions() {
  var curr = window.localStorage.getItem("currencie"),
    settingsOn = window.localStorage.getItem("settingsEnabled"),
    themeEnabled = window.localStorage.getItem("themeEnabled"),
    view = window.localStorage.getItem("view"),
    percentage = window.localStorage.getItem("percent"),
    tab;
  restorePages();

  switch(parseFloat(view)) {
    case 1:
      tab = "#firsttab";
      break;
    case 2:
      tab = "#secondtab";
      break;
    case 3:
      tab = "#thirdtab";
      break;
    case 4:
      tab = "#fourthtab";
      break;
    default:
      tab = "#firsttab";
  }

  $(ticker.activeTab).addClass("inactive");
  $(tab).removeClass("inactive");
  ticker.activeTab = tab;
  if(view != undefined && view != null && view != "null") ticker.view = parseInt(view);

  //Set Currency
  if (curr != undefined) ticker.currency = curr;
  $("#currencieList").val(ticker.currency);

  if (percentage != undefined) ticker.activePercentage = percentage;
  $("#changeHead").text("Change (" + ticker.activePercentage + ")");
  $("#percentList").val(ticker.activePercentage);

  $("#pageNumber").text(ticker.getPageNumber());

  if (settingsOn == true || settingsOn == "true") {
    $(".settings").show();
  } else if (settingsOn == false || settingsOn == "false") {
    $(".settings").hide();
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
  //No idea what happens here
  if (ticker.view != 2) {
    rows = 10;
  } else {

    if (ticker.favourites.length < 10) {
      rows = ticker.favourites.length;
    } else {
      var temp = ticker.favourites.length;

      for (var j = 1; j < ticker.getPageNumber(); j++) {
        temp -= 10;
      }
      if (temp > 10) {
        temp = 10;
      }
      rows = temp;
    }
  }

  $(".row").remove();

  for (var i = 0; i < rows; i++) {
    //Every second row has a different color
    if (i % 2 == 0) {
      row = $("<tr>").addClass("row").appendTo($("table"));
    } else {
      row = $("<tr>").addClass("even").addClass("row").appendTo($("table"));
    }
    //Cells and their values
    var rankcell = $("<td>").addClass("rank").appendTo(row),
      logocell = $("<td>").addClass("logo").appendTo(row),
      namecell = $("<td>").addClass("name").appendTo(row),
      pricecell = $("<td>").addClass("price").appendTo(row),
      changescell = $("<td>").addClass("changes").appendTo(row),
      addcell,
      minuscell;

    if (ticker.view != 2) {
      addcell = $("<td>").addClass("add").appendTo(row);
      addcell.on("click", function (e) {
        addToFavourites(e);
      });
      addcell.on("mousedown", function (e) {
        $(this).toggleClass("inactive");
      });
      addcell.on("mouseup", function (e) {
        $(this).toggleClass("inactive");
      })
    } else {
      minuscell = $("<td>").addClass("minus").appendTo(row);
      minuscell.on("click", function (e) {
        removeFromFavourites(e);
      });
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
  }
}

function buildWindow() {
  //Hide Spinner
  $("div.loader").hide();

  //Settings Area
  $("#bottomWrapper").show();
  $("#currencyTable").show();
  $("#timestampLabel").text("Last update: " + getTime());

  //Table header
  // if ($("#toggleSettings").prop("checked"))

  //Page Navigator
  $("#pageNumber").text(ticker.getPageNumber());
}

//////////////////////////////////
//CORE FUNCTIONS
//////////////////////////////////


function updateTable(j) {

  j = j ? j : 0;

  var updatedData;

  if (ticker.view == 1) {
    ticker.pageLimit = 25;
    updatedData = ticker.data;
  } else if (ticker.view == 2) {
    ticker.pageLimit = 10;
    updatedData = ticker.favourites;
  } else if(ticker.view == 3){
    ticker.pageLimit = 10;
    updatedData = ticker["gainers_" + ticker.activePercentage];
  } else if(ticker.view == 4){
    ticker.pageLimit = 10;
    updatedData = ticker["losers_" + ticker.activePercentage];
  }

  handleTheme(ticker.theme.getStatus());

  $("#pageNumber").text(ticker.getPageNumber());
  console.log(ticker.pageLimit);
  console.log(ticker.getPageNumber());

  if(ticker.getPageNumber() == 1){
    $("#prevPage").addClass("no-page");
    $("#nextPage").removeClass("no-page");
  } else if(ticker.getPageNumber() == ticker.pageLimit){
    $("#nextPage").addClass("no-page");
    $("#prevPage").removeClass("no-page");
  } else {
    $("#nextPage").removeClass("no-page");
    $("#prevPage").removeClass("no-page");
  }


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
    ticker.res = res.slice(0);
    ticker.data = res.slice(0, ticker.limit * 10);


    for (var i = 0; i < ticker.favourites.length; i++) {
      for(var j = 0; j < res.length; j++){
        if(ticker.favourites[i].id == res[j].id){
          ticker.favourites[i] = res[j];
        }
      }
    }

    ticker.fullData = res;
    ticker.setGainersAndLosers();

    updateTable((ticker.getPageNumber() - 1) * 10);

    $("#timestampLabel").text(getTime());
    disableElementForSeconds($("#updateBtn"), 10);
    disableElementForSeconds($("#currencieList"), 2);
    disableElementForSeconds($("#percentList"), 2);

    overlay(false);
  });
}

function lookForFavourites(){

}

//////////////////////////////////
//EVENT HANDLER
//////////////////////////////////
function nextPage() {
  var usedData;

  if (ticker.view == 1) {
    usedData = ticker.data;
    ticker.pageLimit = 25;
  } else if(ticker.view == 2){
    usedData = ticker.favourites;
    ticker.pageLimit = 10;
  } else if(ticker.view == 3){
    usedData = ticker["gainers_" + ticker.activePercentage];
    ticker.pageLimit = 10;
  } else if(ticker.view == 4){
    usedData = ticker["losers_" + ticker.activePercentage];
    ticker.pageLimit = 10;
  }

  if (ticker.getPageNumber() < ticker.pageLimit && ticker.getPageNumber() * 10 < usedData.length) {
    ticker.setPageNumber(ticker.getPageNumber() + 1);
    buildTable();
    updateTable((ticker.getPageNumber() - 1) * 10);
    saveOption("pageNumber" + ticker.view.toString(), ticker.getPageNumber());
    if (ticker.getPageNumber() == ticker.pageLimit) {
      $("#nextPage").addClass("no-page");
    } else {
      $("#prevPage").removeClass("no-page");
      $("#nextPage").removeClass("no-page");
    }
  }
}

function previousPage() {
  if (ticker.getPageNumber() > 1) {
    ticker.setPageNumber(ticker.getPageNumber() - 1);
    buildTable();
    updateTable((ticker.getPageNumber() - 1) * 10);
    saveOption("pageNumber" + ticker.view.toString(), ticker.getPageNumber());
    if (ticker.getPageNumber() == 1) {
      $("#prevPage").addClass("no-page");
    } else {
      $("#nextPage").removeClass("no-page");
      $("#prevPage").removeClass("no-page");
    }
  }
}

function switchTab(tabnumber, currentTab) {
  $(ticker.activeTab).addClass("inactive");
  ticker.view = tabnumber;
  saveOption("view", ticker.view);
  saveOption("pageNumber" + ticker.view.toString(), ticker.getPageNumber());
  $(currentTab).removeClass("inactive");
  ticker.activeTab = currentTab;
  buildTable();
  updateTable((ticker.getPageNumber() - 1) * 10);
}


function showSettings(doShow) {
  doShow ? $("#settings").show() : $("#settings").hide();
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
    index = array.indexOf(e.target) + (10 * (ticker.getPageNumber() - 1)),
    parent = e.target.parentNode.parentNode,
    otherIndex = Array.prototype.indexOf.call(parent.children, e.target.parentNode),
    correctedIndex = (otherIndex-2) + (10 * (ticker.getPageNumber() - 1));

  if (ticker.view == 1) {
    window.open("https://coinmarketcap.com/currencies/" + ticker.data[index].id + "/");
  } else if(ticker.view == 2) {
    var tempRank = parseInt($(e.target).siblings().filter(':first-child').text());
    window.open("https://coinmarketcap.com/currencies/" + ticker.data[tempRank - 1].id + "/");
  } else if(ticker.view == 3){
    window.open("https://coinmarketcap.com/currencies/" + ticker["gainers_" + ticker.activePercentage][correctedIndex].id + "/");
  } else if(ticker.view == 4){
    window.open("https://coinmarketcap.com/currencies/" + ticker["losers_" + ticker.activePercentage][correctedIndex].id + "/");
  }
}

function addToFavourites(e) {
  var elements, array, index, usedData;
  elements = document.getElementsByClassName(e.target.className);
  array = [].slice.call(elements);
  index = array.indexOf(e.target) + (10 * (ticker.getPageNumber() - 1));

  switch(ticker.view){
    case 1:
      usedData = ticker.data;
      break;
    case 3:
      usedData = ticker["gainers_" + ticker.activePercentage];
      break;
    case 4:
      usedData = ticker["losers_" + ticker.activePercentage];
      break;
  }
  if ($.inArray(usedData[index], ticker.favourites) == -1) {
    ticker.favourites.push(usedData[index]);

    var favString = window.localStorage.getItem("fav");
    favString += usedData[index].id + " ";
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
  for (var i = 0; i < ticker.res.length; i++) {

    if (ticker.res[i].rank == tempRank) {
      favString = favString.replace(ticker.res[i].id + " ", "");
      window.localStorage.setItem("fav", favString);
      break;
    }
  }

  buildTable();
  updateTable((ticker.getPageNumber() - 1) * 10);
}


//////////////////////////////////
//HELPER FUNCTIONS
//////////////////////////////////
function getImageUrl(id) {
  return "url(" + "\"../icons/" + id + ".png" + "\"" + ")";
}

function printImageLinks(res) {
  for (var i = 0; i < res.length; i++) {
    console.log('wget "https://files.coinmarketcap.com/static/img/coins/32x32/' + res[i].id + '.png"');
  }

}

function getTime() {
  var timestamp = new Date(Date.now()),
    date = timestamp.toLocaleDateString(),
    time = timestamp.toLocaleTimeString();
  return date + " " + time;
}

function overlay(on) {
  if (on) {
    $("#overlay").show()
      .animate({
        opacity: 0.5
      }, 80);
    $("#smallLoader").show();
  } else {
    $("#overlay").animate({
      opacity: 0.5
    }, 80)
      .hide();
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
  if (data["percent_change_" + ticker.activePercentage] == null) {
    $(element).css("color", "black");
    return "/";
  } else if (parseFloat(data["percent_change_" + ticker.activePercentage]) >= 0) {
    $(element).css("color", "green");
    return data["percent_change_" + ticker.activePercentage] + "%";
  } else if (parseFloat(data["percent_change_" + ticker.activePercentage]) <= 0) {
    $(element).css("color", "#e45567");
    return data["percent_change_" + ticker.activePercentage] + "%";
  }
}
