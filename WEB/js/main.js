app.controller('MainCtrl', function($scope, $location, Service) {
  $scope.getActive = function () {
      $scope.active = "";
      if ($location.path() === "/"){
          $scope.active = "HOME";
      } else if ($location.path().indexOf("1") !== -1){
          $scope.active = "1";
      } else if ($location.path().indexOf("2") !== -1){
          $scope.active = "2";
      }
      return $scope.active;
  };

  $scope.goTo = function(path) {
      $location.path(path);
  }

  $scope.userInfo = {};

  $scope.getData = function(query){
    Service.getUserInfo(query).then(function(success){
        console.log(success.data);
        $scope.userInfo = success.data;
    })
  }
});
