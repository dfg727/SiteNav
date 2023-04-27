var bodyApp = angular.module("bodyApp", ['ApiServiceMod']);
    bodyApp.constant('myConfig',{
        isOtherNav: window.location.href.indexOf('others.html') > 0,
        dataFromType: localStorage.getItem('dataFromType') == null ? 0 : +localStorage.getItem('dataFromType')
    });
    bodyApp.controller('bodyCtrl', ['$scope', 'myConfig', function($scope, myConfig) {
        $scope.quickActions = {
            toggle: false,
            setting: {
                toggle: false
            }
        };
        $scope.quickPanel = {
            toggle: false,
            tap: 2
        };
        $scope.setting = {
            dataFromType: myConfig.dataFromType,  //0 local, 1 bmob, 2 graphql
        };
        $scope.onSettingDataFromType = function() {
            localStorage.setItem('dataFromType', $scope.setting.dataFromType);
        }
        
        $scope.isLoadingFiles = [true];
        switch (myConfig.dataFromType) {
            case 0: 
                loadScript(myConfig.isOtherNav ? './data/others' : './data/index', function(){$scope.isLoadingFiles[0] = false;});
                break;
            case 1:
                loadScript('./sudo/Bmob-2.2.5.min', function(){$scope.isLoadingFiles[0] = false;});
                loadScript('./sudo/BmobHelper', function(){$scope.isLoadingFiles[1] = false;});
                break;
            default:
                $scope.isLoadingFiles = [false];
                break;
            
        }
        
        angular.element(document).off('click').on('click', function (e) {
            e.stopPropagation();
            $scope.quickActions.toggle = false;
            $scope.quickPanel.toggle = false;
            $scope.$apply();
            
        });
    }]);
    
    bodyApp
	.controller("mainCtrl", ["$scope", "apiService", "myConfig", '$interval', function($scope, apiService, myConfig, $interval) {
        $scope.isLoading = true;
        var timer = $interval(function() {
            if ($scope.isLoadingFiles.indexOf(true) == -1) {
                $interval.cancel(timer)
                var query = "";
                if (myConfig.dataFromType == 1) {
                    query = {
                        tableName: 'my_sites',
                        search: {
                            queries: [{
                                criteria: "type",
                                condition: "==",
                                value: myConfig.isOtherNav?2:1,
                            }],
                            orders: ["order"],
                            limit: 1000,
                        }
                    };
                }
                var promise = apiService.getList('site', query);
                promise.then(function(res){
                    if (myConfig.dataFromType == 0) {
                        $scope.siteList = res;
                    } else if (myConfig.dataFromType == 1) {
                        var siteNodes=[]
                        res.forEach(item => {
                            if (item.data.pId.toString() === "0") { 
                                item.data.children=[]; 
                                item.data.added=true; 
                                siteNodes.push(item.data); 
                            }
                        });
                        resetNode(res, siteNodes, true)
                        //console.log(siteNodes)
                        $scope.siteList = siteNodes;
                    }
                    
                    $scope.isLoading = false;
                    $scope.$evalAsync();
                });
                
            }
        }, 100);
    
    }])
    .directive('category', function factory() {
    	return {
    		restrict:'A',
			link:function(scope, element, attrs) {
				$(element).mouseover(function () {
					$(this).addClass("dtSiteOver");
				}).mouseout(function () {
					$(this).removeClass("dtSiteOver");
				}).click(function () {
					$("dd.ddSite").hide().removeClass("ng-hide");
					$(this).next("dd.ddSite").toggle();
				});
			}
        };
    })
    .directive('childSite', function factory() {
    	return {
    		restrict:'A',
			link:function(scope, element, attrs) {
				$(element).click(function () {					
					$(this).next(".ulChildSite").toggleClass("ng-hide");
				});
			}
        };
    });
    
       
    