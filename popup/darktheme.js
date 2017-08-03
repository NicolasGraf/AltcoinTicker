function darktheme() {
    applied = false,
    this.apply = function (){
        $("table td").css("background-color", "#28342c");
        $("tr.even td").css("background-color", "#191a18");
        $("table td").css("border-color", "#171f1a");
        $("table th").css("border-color", "#171f1a");
        $("table th").css("background-color", "#171f1a");
        $(".inactive").css("background-color", "#121913");
        $("table").css("background-color", "#171f1a");
        $("table").css("box-shadow", "none");
        $("table").css("text-shadow", "none");
        $("table").css("border-color", "28342c");
        $("table").css("color", "#bebebe");
        $("body").css("background-color", "#171f1a");
        $("#bottomWrapper").css("text-shadow", "none");
        $("#bottomWrapper").css("color", "#666");
        $("#currencieList").css("background-color", "#3c3d3d");
        $("#currencieList").css("color", "#b1b1b1");
        $("label").css("background-color", "#3c3d3d");
        $("input").css("background-color", "#3c3d3d");
        $("label").css("color", "#afb1b1");
        $("input").css("color", "#afb1b1");
        applied = true;
    },
    this.revert = function(){
        $("table even td").css("background-color", "");
        $("table td").css("background-color", "");
        $("table td").css("border-color", "");
        $("table th").css("border-color", "");
        $("table th").css("background-color", "");
        $("table").css("background-color", "");
        $(".inactive").css("background-color", "##b7b9b9");
        $("table").css("box-shadow", "");
        $("table").css("text-shadow", "");
        $("table").css("border-color", "");
        $("table").css("color", "");
        $("body").css("background-color", "");
        $("#bottomWrapper").css("text-shadow", "");
        $("#bottomWrapper").css("color", "");
        $("#currencieList").css("background-color", "");
        $("#currencieList").css("color", "");
        $("label").css("background-color", "");
        $("input").css("background-color", "");
        $("label").css("color", "");
        $("input").css("color", "");
        applied = false;
    }
    this.getStatus = function(){
        return applied;
    }

}