/**
 * Created by nick on 19.07.17.
 */
var darktheme = {
    apply: function (){
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
    },
    revert: function(){
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