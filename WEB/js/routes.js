app.config(['$routeProvider', 'ChartJsProvider', function ($routeProvider, ChartJsProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    }).when('/1', {
        templateUrl: 'views/1.html',
        controller: '1Ctrl'
    }).when('/2',{
        templateUrl: 'views/2.html',
        controller: '2Ctrl'
    });
}]);
