var app = angular.module('web', ['ngRoute', 'chart.js', 'ngTagsInput', 'moment-picker']);


app.config(['ChartJsProvider', function (ChartJsProvider) {
// Configure all charts
ChartJsProvider.setOptions({
    responsive: false
});
}])