
  //No more than 10 per minute = every 6 seconds
setTimeout(init, 500);

var data, pageNumber;

///////////////////////////////////
//INITIAL
//////////////////////////////////
function init(){
  var limit = 100;
  pageNumber = 1;

  $("#nextPage").on("click", nextPage);

  $("#prevPage").on("click", previousPage);

  $("#updateBtn").on("click", function(){
    update(limit);
  });

  //Setup Table initially
  getData(limit);
}
//////////////////////////////////
//CORE FUNCTIONS
//////////////////////////////////
function getData(limit){
  $.getJSON("https://api.coinmarketcap.com/v1/ticker/?limit=" + limit, function(res) {
    data = res;

    //Show and Hide Elements when API has finished loading
    setup();

    for (var i = 0; i < 10; i++){
      //Every second row has a different color
      if(i % 2 == 0){
        var row = $("<tr>").addClass("altcoin").addClass("row").appendTo($("table"));
      } else {
        var row = $("<tr>").addClass("altcoin even").addClass("row").appendTo($("table"));
      }
      //Link to the website on the row
      row.on("click", function(e){
        goTo(e);
      });

      //Cells and their values
      var rankcell = $("<td>").addClass("rank").text(data[i].rank).appendTo(row),
       logocell = $("<td>").addClass("logo").css("background-image", getImageUrl(data[i].id)).appendTo(row),
       namecell = $("<td>").addClass("name").text(data[i].name).appendTo(row),
       pricecell = $("<td>").addClass("price").text(data[i].price_usd + "$").appendTo(row),
       changescell = $("<td>").addClass("changes").text(data[i].percent_change_24h + "%").appendTo(row);

       //Display Percent Changes in green or red
      if(data[i].percent_change_24h <= 0){
        changescell.css("color", "red");
      } else {
        changescell.css("color", "green")
      }
    }
  });
}

function setup(){
  //Hide Spinner
  $("div.loader").hide();

  //Show Settings Tab
  $("div.settings").show();

  //Set initial Timestamp
  $("#timestampLabel").text(getTime());

  //Show firstrow which all rows get appended to
  $("#firstrow").show();

  //Set PageNumber to 1
  $("#pageNumber").text("1");

  //Grey out the left arrow on the first Page
  $("#prevPage").css("color", "gray");
}

function updateData(j = 0){

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
    $(price).text(data[i].price_usd + "$");
  });
  $.each($("td.changes"), function(i, changes){
    i += j;
    //When the currency is new, it doesn't have this value yet
    if(data[i].percent_change_24h == null){
      $(changes).text("/");
    } else {
      $(changes).text(data[i].percent_change_24h + "%");
    }
    if(data[i].percent_change_24h == null){
      $(changes).css("color", "black");
    } else if(data[i].percent_change_24h > 0){
      $(changes).css("color", "green")
    } else if(data[i].percent_change_24h <= 0){
      $(changes).css("color", "red");
    }
  });
}

//////////////////////////////////
//EVENT HANDLER
//////////////////////////////////
function nextPage(){
  if(pageNumber < 10){
    pageNumber++;
    updateData((pageNumber-1) * 10);
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
    updateData((pageNumber-1) * 10);
    $("#pageNumber").text(pageNumber);
    if(pageNumber == 1){
      $("#prevPage").css("color", "gray");
    } else {
      $("#nextPage").css("color", "black");
    }
  }
}

function goTo(e){
  var elements = document.getElementsByClassName(e.target.className),
    array = [].slice.call(elements),
    index = array.indexOf(e.target) + (10 * (pageNumber-1));

  window.open("https://coinmarketcap.com/currencies/" +  data[index].id + "/");
}

function update(limit){
  $("#updateBtn").attr("disabled", true);
  $.getJSON("https://api.coinmarketcap.com/v1/ticker/?limit=" + limit, function(res) {
    data = res;
    $("#timestampLabel").text(getTime());
  });
  setTimeout(function(){
    $("#updateBtn").removeAttr("disabled");
  }, 10000);
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
