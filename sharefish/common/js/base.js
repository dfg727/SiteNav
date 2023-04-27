
var appBody = angular.module('bodyApp', ['ngRoute', 'ngSanitize', 'ngQuill', 'ngNotify', 'CommonServiceMod', 'ApiServiceMod']);
appBody.constant('myConfig',{
        isOtherNav: window.location.href.indexOf('others.html') > 0,
        dataFromType: localStorage.getItem('dataFromType') == null ? 0 : +localStorage.getItem('dataFromType')
    })
    .config(function($routeProvider, $locationProvider) {
        $routeProvider.when('/nav', {
            templateUrl: './common/templates/nav.html',
            controller: 'navCtrl'
        }).when('/note', {
            title: 'note',
            templateUrl: './common/templates/note.html',
            controller: 'noteCtrl'
        }).when('/note2', {
            templateUrl: './common/templates/note2.html',
            controller: 'note2Ctrl'
        }).when('/kanban', {
            templateUrl: './common/templates/kanban.html',
            controller: 'kanbanCtrl'
        })
        .otherwise({
            redirectTo: '/nav'
        });
    });
appBody.controller('bodyCtrl', ['$scope', function($scope) {
	$scope.topMenuToggle = false;
    $scope.quickPanelToggle = false;
    $scope.demoPanelToggle = false;

    $(window).scroll(function(){
        if($(this).scrollTop()>300){//当window的scrolltop距离大于1时，go to top按钮淡出，反之淡入
            $("body").attr('data-scrolltop', 'on');
        } else {
            $("body").removeAttr('data-scrolltop');
        }
    });

}]);
appBody.controller('navCtrl', ['$scope', "$location", "$anchorScroll", function($scope, $location, $anchorScroll) {
    
	$scope.siteList = [{
		id: 1, name: "常用", pId: 0, status: "1", children: [
			{id: 100, name: "有道 -- 翻译", pId: 1, status: "1", uri: "http://fanyi.youdao.com/"},
			{desc: "sous", id: 120,
			name: "虫部落资源搜索",
			pId: 1,
			status: "1",
			uri: "http://magnet.chongbuluo.com"}
		]
	}]

	$scope.anchorScroll = function(index) {
		$location.hash("nav"+index);
		$anchorScroll(); 
	}

}]);

appBody.controller('noteCtrl', ['$scope', "$location", "$anchorScroll", "$timeout", "apiService", function($scope, $location, $anchorScroll, $timeout, apiService) {
	$scope.noteList = [
		{id:1, title: "title", message:"<p>note</p><pre class=\"ql-syntax\">&lt;script&gt;var sdf=\"\";&lt;/script&gt;</pre>", status:1}
	]
	$scope.detail = {toggle:false, selectedNote:{}, editingDesc:false, editingTitle:false};
	
	
	$scope.showDetail = function(index) {
		$scope.detail = {
			index,
			selectedNote: $scope.noteList[index],
			toggle: true,
			editingDesc: false,
			editingTitle: false,
			title: _.cloneDeep($scope.noteList[index].title),
			message: _.cloneDeep($scope.noteList[index].message)
		};
		$scope.highlightBlock();
	};

	$scope.saveNoteTitle = function() {
		$scope.detail.selectedNote.title = _.cloneDeep($scope.detail.title);
		$scope.detail.editingTitle = false;
	};
	$scope.cancelNoteTitle = function() {
		$scope.detail.title = _.cloneDeep($scope.detail.selectedNote.title)
		$scope.detail.editingTitle = false;
	};
	$scope.saveNoteMsg = function() {
		$scope.detail.selectedNote.message = _.cloneDeep($scope.detail.message);
		$scope.detail.editingDesc = false;
		$scope.highlightBlock();
	};
	$scope.cancelNoteMsg = function() {
		$scope.detail.message = _.cloneDeep($scope.detail.selectedNote.message)
		$scope.detail.editingDesc = false;
	};
	
	angular.element(document).off('click').on('click', function (e) {
		e.stopPropagation();
		if ($scope.detail.editingTitle) {
			$scope.saveNoteTitle();
		}
		$scope.$apply();
	});
		
	$scope.highlightBlock = function() {
		$timeout(function(){
			document.querySelectorAll('pre').forEach((block) => {
				hljs.highlightBlock(block);
			});
		}, 100);
	};
}]);

appBody.controller('note2Ctrl', ['$scope', "$location", "$anchorScroll", "$timeout", "ngNotify", "apiService", function($scope, $location, $anchorScroll, $timeout, ngNotify, apiService) {
	$scope.loading = true;
	$scope.detail = {index:-1, toggle:false, selectedNote:{title:"", message:""}, editingDesc:false, editingTitle:false, title:"", message:""};
	
	$scope.showDetail = function(index) {
		$scope.detail = index==-1?{index:-1, toggle:true, selectedNote:{title:"", message:""}, editingDesc:false, editingTitle:false, title:"", message:""}:{
                index,
                selectedNote: $scope.noteList[index],
                toggle: true,
                editingDesc: false,
                editingTitle: false,
                title: _.cloneDeep($scope.noteList[index].title),
                message: _.cloneDeep($scope.noteList[index].message)
            };
		//$scope.highlightBlock();
        $scope.onClickNoteView();
	};
	$scope.backListView = function() {
		$scope.detail = { 
			...$scope.detail,
			toggle: false,
			editingDesc: false,
			editingTitle: false,
		}
	}

	$scope.saveNoteTitle = function() {
		$scope.detail.selectedNote.title = _.cloneDeep($scope.detail.title);
		$scope.detail.editingTitle = false;
        
        var apiParams = {
            "id": $scope.detail.selectedNote.id,
            "inputData" : {
              "title": $scope.detail.title,
              status: 1
            }
        };
        $scope.saveNote(apiParams);
	};
	$scope.cancelNoteTitle = function() {
		$scope.detail.title = _.cloneDeep($scope.detail.selectedNote.title)
		$scope.detail.editingTitle = false;
	};
	$scope.saveNoteMsg = function() {
        //$scope.detail.message = $scope.testEditor.getMarkdown();
        //$scope.testEditor.previewing();
		$scope.detail.selectedNote.message = _.cloneDeep($scope.detail.message);
		//$scope.detail.editingDesc = false;
		//$scope.highlightBlock();
        
        var apiParams = {
            "id": $scope.detail.selectedNote.id,
            "inputData" : {
              "message": $scope.detail.message,
              status: 1
            }
        };
        $scope.saveNote(apiParams);
	};
    
	$scope.cancelNoteMsg = function() {
		$scope.detail.message = _.cloneDeep($scope.detail.selectedNote.message)
		$scope.detail.editingDesc = false;
	};
	
    $scope.onClickNoteView = function() {
        $scope.detail.editingDesc=true
        $("#markdown-editor").markdown({
            savable:true,
            onShow: function(e) {
            },
            onChange: function(e){
                console.log('onChange')
            },
            onSave: function(e) {
                //alert("Saving '"+e.getContent()+"'...")
                $scope.detail.message=e.getContent();
                $scope.saveNoteMsg();
            },
            onPreview: function(e) {
                console.log('onPreview')
            },
            onFocus: function(e) {
                //e.hidePreview();
                console.log('onFocus')
            },
            onBlur: function(e) {
                //alert("Blur triggered!")
                //e.showPreview();
                console.log('onBlur')
            }
        });
        var $editorMarkdown = $("#markdown-editor").data('markdown');
        if ($editorMarkdown.$isPreview) $editorMarkdown.hidePreview();
    }
    
	angular.element(document).off('click').on('click', function (e) {
		e.stopPropagation();
		if ($scope.detail && $scope.detail.editingTitle) {
			$scope.saveNoteTitle();
            $scope.$apply();
		}
	});
		
	$scope.highlightBlock = function() {
		$timeout(function(){
			document.querySelectorAll('pre').forEach((block) => {
				hljs.highlightBlock(block);
			});
		}, 100);
	};
    
    $scope.saveNote = function(apiParams) {
        
        var apiQuery = `
            mutation($saveNoteInput: SaveNoteInput!) {
              saveNote(input: $saveNoteInput) {
                id
                updatedAt
              }
            }
        `;
        apiService.getList("note", apiQuery, {"saveNoteInput":apiParams})
            .then(function (response) {
                if ($scope.detail.index == -1) {
                    $scope.noteList.push({
                        id: response.saveNote.id,
                        ...apiParams.inputData
                    });
                    $scope.$evalAsync();
                    $scope.showDetail($scope.noteList.length-1);
                }
                ngNotify.set("save completed.", {
                    type: "success"
                });
                /*
                $.notify({
                    // options
                    message: 'save completed.' 
                },{
                    // settings
                    type: 'primary',
                    placement: {
                        align: "center",
                        from: "top",
                    },
                    animate: {
                        enter: "animate__animated animate__fadeIn",
                        exit: "animate__animated animate__fadeOut"
                    },
                    delay: "1000",
                    timer: "1000"
                });
                */
                console.log('save completed.');
            });
    }
    $scope.getList = function() {
        var apiParams = {
            page: 1,
            perPage: 20,
            key: "",
            sort: "updatedAt",
        };
        
        var apiQuery = `
            query($getNoteTypeListInput: GetListInput!, $getNoteListInput: GetListInput!) {
                getNoteTypeList(input: $getNoteTypeListInput) {
                    data {
                      id
                      title
                      status
                    }
                    paging {
                      page
                      perPage
                      total
                    }
                }
                getNoteList(input: $getNoteListInput) {
                    data {
                      id
                      title
                      message
                      status
                      type
                      tags
                      isStar
                      createdAt
                      updatedAt
                    }
                    paging {
                      page
                      perPage
                      total
                    }
                }
            }
        `;
        apiService.getList("note", apiQuery, {"getNoteTypeListInput":apiParams, "getNoteListInput":apiParams})
            .then(function (response) {
                $scope.noteTypeList = response.getNoteTypeList.data;
                $scope.noteList = response.getNoteList.data;
                $scope.loading = false;
            });
    }
    $scope.getList();
}]);

appBody.controller('kanbanCtrl', ['$scope', "$location", "$anchorScroll", function($scope, $location, $anchorScroll) {
	
}]);