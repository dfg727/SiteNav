
angular.module("BmobServiceMod", [])
    .service('bmobService', ['$q', '$http', 'myConfig', function($q, $http, myConfig) {

        var bmobHelper;
        this.getRecords = function(query) {
            bmobHelper = bmobHelper === undefined ? new BmobHelper() : bmobHelper;
            return bmobHelper.getRecords(query);
        };
        
    }]);