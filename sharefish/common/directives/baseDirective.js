appBody.directive("ssHeader", ["$rootScope", "$location", function($rootScope, $location) {
    return {
        restrict: 'EA',
        scope: false,
        replace: true,
        link: function(scope, element) {
            //scope.quickPanelToggle = true;
        },
        templateUrl: 'common/templates/header.html'
    }
    }]);
    
appBody.directive("ssFooter", ["$rootScope", "$location", function($rootScope, $location) {
    return {
        restrict: 'EA',
        scope: false,
        replace: true,
        link: function(scope, element) {
            console.log('ssFooter:')
        },
        templateUrl: 'common/templates/footer.html'
    }
    }]);

appBody.directive("ssQuickPanel", ["$rootScope", "$location", function($rootScope, $location) {
    return {
        restrict: 'EA',
        replace: true,
        scope: false,
        link: function(scope, element) {
            scope.quickPanelTap = 0;
        },
        templateUrl: 'common/templates/quickPanel.html'
    }
    }]);

appBody.directive("ssScrollTop", ["$rootScope", "$location", "$anchorScroll", function($rootScope, $location, $anchorScroll) {
    return {
        restrict: 'EA',
        replace: true,
        scope: false,
        link: function(scope, element) {
            scope.scrollTop = function() {
                $location.hash("ng-app");
                $anchorScroll(); 
                //$("html,body").animate({scrollTop:0}, 600);
            }
        },
        templateUrl: 'common/templates/scrollTop.html'
    }
    }]);

appBody.directive("ssStickyToolbar", ["$rootScope", "$location", function($rootScope, $location) {
    return {
        restrict: 'EA',
        replace: true,
        scope: false,
        link: function(scope, element) {
            console.log('ssStickyToolbar:')
        },
        templateUrl: 'common/templates/stickyToolbar.html'
    }
    }]);

appBody.directive("ssDemoPanel", ["$rootScope", "$location", function($rootScope, $location) {
    return {
        restrict: 'EA',
        replace: true,
        scope: false,
        link: function(scope, element) {
            console.log('ssDemoPanel:')
        },
        templateUrl: 'common/templates/demoPanel.html'
    }
    }]);