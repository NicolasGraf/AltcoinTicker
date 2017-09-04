function darktheme() {
  this.applied = false;

  this.apply = function () {

    $("body").css("background-color", "#171f1a");
    $(".inactive").css("background-color", "#121913");

    $("table, th").css({
      backgroundColor: "#171f1a",
      boxShadow: "none",
      textShadow: "none",
      borderColor: "28342c",
      color: "#bebebe"
    });

    $("td").css({
      backgroundColor: "#28342c",
      borderColor: "#171f1a"
    });

    $("th").css({
      borderColor: "#171f1a"
    });

    $("tr.even td").css("background-color", "#191a18");
    $("#bottomWrapper").css({
      textShadow: "none",
      color: "#666666"
    });

    $("#currencieList, #percentList").css({
      backgroundColor: "#3c3d3d",
      color: "#b1b1b1"
    });

    $("label, input").css({
      backgroundColor: "#3c3d3d",
      color: "#afb1b1"
    });

    this.applied = true;
  };
  this.revert = function () {
    $("table even td, table td, table th, body," +
      " table, #currencieList, #percentList, label, input").css("background-color", "");

    $("table td, table th, table").css("border-color", "");
    $(".inactive").css("background-color", "##b7b9b9");

    $("table, #bottomWrapper, table th").css({
      boxShadow: "",
      textShadow: "",
      color: ""
    });
    $("label, input, #percentList, #currencieList").css("color", "");
    this.applied = false;
  };
  this.getStatus = function () {
    return this.applied;
  }

}