
angular.module("GraphqlServiceMod", [])
    .service('graphqlService', ['$q', '$http', function($q, $http) {
        
        var graphql = { };

        graphql.query = function (query, variables, header) {
            var defer = $q.defer();
            
            $http({
                method: 'POST',
                url: "http://10.1.9.55:4002",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + 'access_token',
                    ...header
                },
                data: JSON.stringify({
                    query, 
                    variables,
                })
            }).then(function (response) {
                return defer.resolve(response.data.data);
            });


            return defer.promise;
        };
        return graphql;
    }]);