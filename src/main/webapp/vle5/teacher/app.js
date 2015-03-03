define([
        'angular',
        'jquery',
        'angularUIRouter',
        'angularPostMessage',
        'configService',
        'projectService',
        'nodeApplicationService',
        'nodeService',
        'studentDataService'
        ], function(angular, $) {

	var app = angular.module('app', [
	                                 'ui.router',
	                                 'ngPostMessage',
	                                 'ConfigService',
	                                 'ProjectService',
	                                 'NodeApplicationService',
	                                 'NodeService',
	                                 'StudentDataService'
	                                 ]);
	
	app.init = function() {
		angular.bootstrap(document, ['app']);
	};
	
	app.loadController = function(controllerName) {
		return ['$q', function($q) {
			var deferred = $q.defer();
			require([controllerName], function() {
				deferred.resolve();
			});
			return deferred.promise;
		}];
	};
	
	app.config(['$urlRouterProvider', '$stateProvider', '$controllerProvider', 
	            function($urlRouterProvider, $stateProvider, $controllerProvider) {
		
		$urlRouterProvider.otherwise('/author');
		
		app.$controllerProvider = $controllerProvider;
		
		$stateProvider
		    .state('root', {
		        url: '',
		        abstract: true,
		        template: '<ui-view/>',
		        resolve: {
		            config: function(ConfigService) {
		                var configUrl = window.configUrl;
		                return ConfigService.retrieveConfig(configUrl);
		            },
		            project: function(ProjectService, config) {
		                return ProjectService.retrieveProject();
		            },
                    nodeApplication: function(NodeApplicationService, config) {
                        return NodeApplicationService.intializeNodeApplications();
                    },
                    studentData: function(StudentDataService, config) {
                        return StudentDataService.retrieveStudentData();
                    }
		        }
		    })
            .state('author', {
                parent: 'root',
                url: '/author',
                templateUrl: 'vle5/teacher/author.html',
                controller: 'VLEController',
                controllerAs: 'author',
                resolve: {
                    loadController: app.loadController('vleController')
                }
            })
	}]);
	
	return app;
});