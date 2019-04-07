app.factory('Service', function ($http) {
    var url =  'http://localhost:3001'
    return {
        getUserInfo: function(query){
            return $http.get(url + '/user/'+ query);
        },
        getTopicInfo: function(query){
            return $http.get(url + '/search/'+ query);
        },
        getUserProfile: function(query){
            return $http.get(url + '/user/info/'+ query);
        },
        getUserProfileTopic: function(query){
            return $http.get(url + '/topics/'+ query);
        }
    }
});
