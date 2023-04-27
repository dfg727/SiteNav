
angular.module("ApiServiceMod", ["GraphqlServiceMod", "BmobServiceMod"])
    .service('apiService', ['$q', '$http', "myConfig", 'graphqlService', "bmobService", function($q, $http, myConfig, graphqlService, bmobService) {
        this.getList = function(obj, query, variables) {
            var dataFromType = obj === 'note' ? 2 : myConfig.dataFromType;  //this is for test note list
            switch(dataFromType) {
                case 1:
                    return bmobService.getRecords(query);
                    break;
                case 2:
                    return graphqlService.query(query, variables);
                    break;
                default:
                    var res = [{"id":1}];
                    switch(obj) {
                        case 'site':
                            res = myConfig.isOtherNav ? others_site_list : site_list;
                            break;
                        default:
                            break;
                    }
                    var defer = $q.defer();
                    defer.resolve(res);
                    return defer.promise
                    break;
            }
        };
        
    }]);