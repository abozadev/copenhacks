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

  $scope.dadesrebudes = false;

  $scope.getData = function(query){
    Service.getUserInfo(query).then(function(success){
        $scope.userInfo = success.data;
        $scope.userInfo.averageScore =  $scope.userInfo.averageScore * 100;
        $scope.userInfo.averageScore = $scope.userInfo.averageScore.toFixed(2);
        $scope.dadesrebudes = true;
        $scope.averageNegative = 100 - $scope.userInfo.averageScore;


        $scope.ctx = document.getElementById("myChart");;
        $scope.myChart = new Chart($scope.ctx,{
        type: 'doughnut',
        data: [$scope.averageNegative, $scope.userInfo.averageScore],
            labels: [
                'Red',
                'Green'
            ]
    })
        console.log(success.data);
    })
  }
});


