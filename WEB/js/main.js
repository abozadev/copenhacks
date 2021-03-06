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
  $scope.landingpage = true;

  $scope.getData = function(query){
    Service.getUserInfo(query).then(function(success){
        $scope.userInfo = success.data;
        $scope.userInfo.averageScore =  $scope.userInfo.averageScore * 100;
        $scope.userInfo.averageScore = $scope.userInfo.averageScore.toFixed(2);
        $scope.averageNegative = 100 - $scope.userInfo.averageScore;
        $scope.averageNegative = $scope.averageNegative.toFixed(2);
        $scope.dadesrebudes = true;
        $scope.landingpage = false;


        $scope.labels = ["Negative", "Positive"];
        $scope.data = [$scope.averageNegative, 100 - $scope.averageNegative];
    })
    Service.getUserProfile(query).then(function(success){
        $scope.userProfile = success.data;
        $scope.userProfile.profile_image_url = $scope.userProfile.profile_image_url.split('_normal')[0] + "." + $scope.userProfile.profile_image_url.split('.')[ $scope.userProfile.profile_image_url.split('.').length - 1];
        $scope.colors = ["#FF4A52", "#6BD98D"];
        
    });
    Service.getUserProfileTopic(query).then(function(success){
        $scope.topics = success.data;
        if ($scope.topics.length > 0){
            $scope.usedTopics = "#" + success.data[0];
            for (var i = 1; i < 10; i++){
                $scope.usedTopics += ", #" + success.data[i];
            }
        }
    })
  }
});