
  //No more than 10 per minute = every 6 seconds
setTimeout(init, 500);

var data;

///////////////////////////////////
//INITIAL
//////////////////////////////////
function init(){
  pageNumber = 1,
  currency = "USD";
  var limit = 100;

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

  $("#updateBtn").on("click", function(){
    updateData(limit);
  });

  $("#currencieList").on("change", function(){
    currency = $(this).val();
    updateData(limit);
  });

  $("#toggleSettings").on("change", toggleSettings);

  $("#toggleTheme").on("change", toggleTheme);

  $("#popout").on("click", function(){
    $("body").css("width", "");
    console.log($("body"));
    popout();
  });

  //Get Data intially
  $.getJSON("https://api.coinmarketcap.com/v1/ticker/?convert=" + currency + "&limit=" + limit, function(res) {
    data = res;
    //Show and Hide Elements when API has finished loading
    buildWindow();
    buildTable();
  });
}

function buildTable(){
  for (var i = 0; i < 10; i++){
    //Every second row has a different color
    if(i % 2 == 0){
      var row = $("<tr>").addClass("altcoin").addClass("row").appendTo($("table"));
    } else {
      var row = $("<tr>").addClass("altcoin").addClass("even").addClass("row").appendTo($("table"));
    }
    //Link to the website on the row
    row.on("click", function(e){
      goTo(e);
    });

    //Cells and their values
    var rankcell = $("<td>").addClass("rank").text(data[i].rank).appendTo(row),
     logocell = $("<td>").addClass("logo").css("background-image", getImageUrl(data[i].id)).appendTo(row),
     namecell = $("<td>").addClass("name").text(data[i].name).appendTo(row),
     pricecell = $("<td>").addClass("price").text(getFormattedPrice(data[i])).appendTo(row),

     changescell = $("<td>").addClass("changes").appendTo(row).text(getFormattedChange(data[i], changescell));
     var changeText = getFormattedChange(data[i], changescell);
  }
}

function buildWindow(){
  //Hide Spinner
  $("div.loader").hide();

  //Settings Area
  $("#toggle").show();
  $("#timestampLabel").text(getTime());

  //Table header
  $("#firstrow").show();

  $(".settings").show();

  //Page Navigator
  $("#pages").css("display", "inline-block");
  $("#pageNumber").text("1");
  $("#prevPage").css("color", "gray");
}

//////////////////////////////////
//CORE FUNCTIONS
//////////////////////////////////


function updateTable(j, data){

  j = j ? j : 0;

  $.each($("td.rank"), function(i, rank){
    i += j;
    $(rank).text(data[i].rank);
  });
  $.each($("td.logo"), function(i, logo){
    i += j;
    $(logo).css("background-image", getImageUrl(data[i].id));
  });
  $.each($("td.name"), function(i, name){
    i += j;
    $(name).text(data[i].name);
  });
  $.each($("td.price"), function(i, price){
    i += j;
    $(price).text(getFormattedPrice(data[i]));
  });
  $.each($("td.changes"), function(i, changes){
    i += j;
    $(changes).text(getFormattedChange(data[i], changes));
  });
}

function updateData(limit){
  overlay(true);
  $.getJSON("https://api.coinmarketcap.com/v1/ticker/?convert=" + currency + "&limit=" + limit, function(res) {
    data = res;

    updateTable((pageNumber-1) * 10, data);

    $("#timestampLabel").text(getTime());
    disableElementForSeconds($("#updateBtn"), 10);
    disableElementForSeconds($("#currencieList"), 2);

    overlay(false);
  });
}

//////////////////////////////////
//EVENT HANDLER
//////////////////////////////////
function nextPage(){
  if(pageNumber < 10){
    pageNumber++;
    updateTable((pageNumber-1) * 10, data);
    $("#pageNumber").text(pageNumber);
    if(pageNumber == 10){
      $("#nextPage").css("color", "gray");
    } else {
      $("#prevPage").css("color", "black");
    }
  }
}

function previousPage(){
  if(pageNumber > 1){
    pageNumber--;
    updateTable((pageNumber-1) * 10, data);
    $("#pageNumber").text(pageNumber);
    if(pageNumber == 1){
      $("#prevPage").css("color", "gray");
    } else {
      $("#nextPage").css("color", "black");
    }
  }
}

function toggleSettings(){
  $(".settings").toggle();
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

function toggleTheme(e){
  if(e.target.checked){
    $("table td").css("background-color", "#28342c");
    $("tr.even td").css("background-color", "#191a18");
    $("table td").css("border-color", "#171f1a");
    $("table th").css("border-color", "#171f1a");
    $("table th").css("background-color", "#171f1a");
    $("table").css("background-color", "#171f1a");
    $("table").css("box-shadow", "none");
    $("table").css("text-shadow", "none");
    $("table").css("border-color", "28342c");
    $("body").css("color", "#eee");
    $("body").css("background-color", "#171f1a");
    $("#bottomWrapper").css("text-shadow", "none");
    $("#bottomWrapper").css("color", "#666");
    $("label").css("background-color", "#3c3d3d");
    $("input").css("background-color", "#3c3d3d");
    $("label").css("color", "#afb1b1");
    $("input").css("color", "#afb1b1");
  } else {
    $("table even td").css("background-color", "");
    $("table td").css("background-color", "");
    $("table td").css("border-color", "");
    $("table th").css("border-color", "");
    $("table th").css("background-color", "");
    $("table").css("background-color", "");
    $("table").css("box-shadow", "");
    $("table").css("text-shadow", "");
    $("table").css("border-color", "");
    $("body").css("color", "");
    $("body").css("background-color", "");
    $("#bottomWrapper").css("text-shadow", "");
    $("#bottomWrapper").css("color", "");
    $("label").css("background-color", "");
    $("input").css("background-color", "");
    $("label").css("color", "");
    $("input").css("color", "");
  }
}

function goTo(e){
  var elements = document.getElementsByClassName(e.target.className),
    array = [].slice.call(elements),
    index = array.indexOf(e.target) + (10 * (pageNumber-1));

  window.open("https://coinmarketcap.com/currencies/" +  data[index].id + "/");
}

//////////////////////////////////
//HELPER FUNCTIONS
//////////////////////////////////
function getImageUrl(id){
  return "url(" + "\"/icons/" + id + ".png" + "\"" + ")";
}

function getTime(){
  var timestamp = new Date(Date.now()),
    date = timestamp.toLocaleDateString(),
    time = timestamp.toLocaleTimeString();
  return date + " " + time;
}

function overlay(on){
  if(on){
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
function disableElementForSeconds(elem, seconds){
  elem.attr("disabled", true);
  setTimeout(function(){
    elem.removeAttr("disabled");
  }, seconds*1000);
}

function getFormattedPrice(element){
  var value = parseFloat(element[currenciePriceStrings[currency]]),
    rounded = value.toFixed(4),
    symbol = currencies[currency];

  if(currency == "BTC"){
    rounded = value.toFixed(8);
  }
  return rounded + symbol;
}

function getFormattedChange(data, element){
  if(data.percent_change_24h == null){
    $(element).css("color", "black");
    return "/";
  } else if(parseFloat(data.percent_change_24h) >= 0){
      $(element).css("color", "green");
      return data.percent_change_24h + "%";
  } else if(parseFloat(data.percent_change_24h) <= 0){
      $(element).css("color", "#e45567");
      return data.percent_change_24h + "%";
  }
}
