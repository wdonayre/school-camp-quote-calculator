/*
    Author: William Donayre Jr.
    Github: https://github.com/wdonayre
    E-Mail: wdonayredroid@gmail.com
    Date: 08/11/2017
*/
if (!function_exists('numberWithCommas')) {
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

(function($) {


}(window.jQuery || window.$));