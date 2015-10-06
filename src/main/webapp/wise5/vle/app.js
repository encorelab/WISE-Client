define([
    'angular',
    'bootstrap',
    'd3',
    'directives',
    'filters',
    'jquery',
    'jqueryUI',
    'angularAnimate',
    'angularAria',
    'angularMaterial',
    'angularAudio',
    'angularDragDrop',
    'angularFileUpload',
    'angularSortable',
    'angularTextAngular',
    'angularToArrayFilter',
    'angularUIRouter',
    'angularUITree',
    'angularWebSocket',
    'audioRecorderService',
    'configService',
    'cRaterService',
    'discussionService',
    'drawService',
    'graphService',
    'highcharts-ng',
    'htmlService',
    'matchService',
    'multipleChoiceService',
    'nodeService',
    'ocLazyLoad',
    'openResponseService',
    'outsideURLService',
    'photoBoothService',
    'notebookService',
    'notebook',
    'projectService',
    'sessionService',
    'studentAssetService',
    'studentDataService',
    'studentStatusService',
    'studentWebSocketService',
    'tableService',
    'webfont',
    'webfonts'
], function (angular,
             bootstrap,
             d3,
             directives,
             filters,
             $,
             jqueryUI,
             angularAnimate,
             angularAria,
             angularMaterial,
             angularAudio,
             angularDragDrop,
             angularFileUpload,
             angularSortable,
             angularTextAngular,
             angularToArrayFilter,
             angularUIRouter,
             angularUITree,
             angularWebSocket,
             audioRecorderService,
             configService,
             cRaterService,
             discussionService,
             drawService,
             graphService,
             highchartsng,
             htmlService,
             matchService,
             multipleChoiceService,
             nodeService,
             ocLazyLoad,
             openResponseService,
             outsideURLService,
             photoBoothService,
             notebookService,
             notebook,
             projectService,
             sessionService,
             studentAssetService,
             studentDataService,
             studentStatusService,
             studentWebSocketService,
             tableService,
             webfont,
             webfonts) {

    var app = angular.module('app', [
        'directives',
        'filters',
        'notebook',
        'highcharts-ng',
        'ui.router',
        'ui.sortable',
        'ui.tree',
        'angular-toArrayFilter',
        'ngAnimate',
        'ngAudio',
        'ngAria',
        'ngDragDrop',
        'ngFileUpload',
        'ngMaterial',
        'ngWebSocket',
        'oc.lazyLoad',
        'textAngular'
    ]);

    // core services
    app.factory('ConfigService', configService);
    app.factory('CRaterService', cRaterService);
    app.factory('NodeService', nodeService);
    app.factory('NotebookService', notebookService);
    app.factory('ProjectService', projectService);
    app.factory('SessionService', sessionService);
    app.factory('StudentAssetService', studentAssetService);
    app.factory('StudentDataService', studentDataService);
    app.factory('StudentStatusService', studentStatusService);
    app.factory('StudentWebSocketService', studentWebSocketService);

    // node services
    app.factory('AudioRecorderService', audioRecorderService);
    app.factory('DiscussionService', discussionService);
    app.factory('DrawService', drawService);
    app.factory('GraphService', graphService);
    app.factory('HTMLService', htmlService);
    app.factory('MatchService', matchService);
    app.factory('MultipleChoiceService', multipleChoiceService);
    app.factory('PhotoBoothService', photoBoothService);
    app.factory('OpenResponseService', openResponseService);
    app.factory('OutsideURLService', outsideURLService);
    app.factory('TableService', tableService);

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

    app.config(['$urlRouterProvider',
        '$stateProvider',
        '$compileProvider',
        '$controllerProvider',
        '$mdThemingProvider',
        '$ocLazyLoadProvider',
        function($urlRouterProvider,
                 $stateProvider,
                 $compileProvider,
                 $controllerProvider,
                 $mdThemingProvider) {

            $urlRouterProvider.otherwise('/vle/');

            app.$controllerProvider = $controllerProvider;
            app.$compileProvider = $compileProvider;

            $stateProvider
                .state('root', {
                    url: '',
                    abstract: true,
                    //templateUrl: 'wise5/vle/vle.html',
                    templateProvider: ['$http', 'ProjectService', function ($http, ProjectService) {
                        var vlePath = 'wise5/vle/themes/' + ProjectService.getTheme();
                        return $http.get(vlePath + '/vle.html').then(
                            function (response) {
                                return response.data;
                            }
                        );
                    }],
                    controller: 'VLEController as vleController',
                    resolve: {
                        vleController: app.loadController('vleController'),
                        config: function (ConfigService) {
                            var configUrl = window.configUrl;
                            return ConfigService.retrieveConfig(configUrl);
                        },
                        project: function (ProjectService, config) {
                            return ProjectService.retrieveProject();
                        },
                        sessionTimers: function (SessionService, config) {
                            return SessionService.initializeSession();
                        },
                        studentData: function (StudentDataService, config, project) {
                            return StudentDataService.retrieveStudentData();
                        },
                        webSocket: function (StudentWebSocketService, config) {
                            return StudentWebSocketService.initialize();
                        }
                    }
                })
                .state('root.vle', {
                    url: '/vle/:nodeId',
                    views: {
                        'navigationView': {
                            //templateUrl: 'wise5/vle/navigation/navigation.html',
                            templateProvider: ['$http', 'ProjectService', function ($http, ProjectService) {
                                var navPath = 'wise5/vle/themes/' + ProjectService.getTheme() + '/navigation/navigation.html';
                                return $http.get(navPath).then(
                                    function (response) {
                                        return response.data;
                                    }
                                );
                            }],
                            controller: 'NavigationController as navCtrl',
                            resolve: {
                                navigationController: app.loadController('navigationController')
                            }
                        },
                        'nodeView': {
                            templateUrl: 'wise5/node/index.html',
                            controller: 'NodeController as nodeCtrl',
                            resolve: {
                                nodeController: app.loadController('nodeController')
                            },
                            resolve: {
                                audioRecorderController: app.loadController('audioRecorderController'),
                                cRaterController: app.loadController('cRaterController'),
                                discussionController: app.loadController('discussionController'),
                                drawController: app.loadController('drawController'),
                                graphController: app.loadController('graphController'),
                                htmlController: app.loadController('htmlController'),
                                matchController: app.loadController('matchController'),
                                multipleChoiceController: app.loadController('multipleChoiceController'),
                                nodeController: app.loadController('nodeController'),
                                openResponseController: app.loadController('openResponseController'),
                                outsideURLController: app.loadController('outsideURLController'),
                                photoBoothController: app.loadController('photoBoothController'),
                                planningController: app.loadController('planningController'),
                                tableController: app.loadController('tableController')
                            }
                        }
                    }
                });

            // ngMaterial default theme configuration
            // TODO: make dynamic and support alternate themes; allow projects to specify theme parameters and settings
            $mdThemingProvider.definePalette('primary', {
                '50': 'e1f0f4',
                '100': 'b8dbe4',
                '200': '8ec6d4',
                '300': '5faec2',
                '400': '3d9db5',
                '500': '1c8ca8',
                '600': '197f98',
                '700': '167188',
                '800': '136377',
                '900': '0e4957',
                'A100': 'abf3ff',
                'A200': '66e2ff',
                'A400': '17bee5',
                'A700': '00A1C6',
                'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                                    // on this palette should be dark or light
                'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                    '200', '300', 'A100'],
                'contrastLightColors': undefined    // could also specify this if default was 'dark'
            });

            $mdThemingProvider.definePalette('accent', {
                '50': 'fde9e6',
                '100': 'fbcbc4',
                '200': 'f8aca1',
                '300': 'f4897b',
                '400': 'f2705f',
                '500': 'f05843',
                '600': 'da503c',
                '700': 'c34736',
                '800': 'aa3e2f',
                '900': '7d2e23',
                'A100': 'ff897d',
                'A200': 'ff7061',
                'A400': 'ff3829',
                'A700': 'cc1705',
                'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                                    // on this palette should be dark or light
                'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                    '200', '300', 'A100'],
                'contrastLightColors': undefined    // could also specify this if default was 'dark'
            });

            $mdThemingProvider.theme('default')
                .primaryPalette('primary')
                .accentPalette('accent',  {
                    'default': '500' // use shade 200 for default, and keep all other shades the same
                });

            var lightMap = $mdThemingProvider.extendPalette('grey', {
                'A100': 'ffffff'
            });
            $mdThemingProvider.definePalette('light', lightMap);

            $mdThemingProvider.theme('light')
                .primaryPalette('light', {
                    'default': 'A100'
                })
                .accentPalette('primary');

            $mdThemingProvider.setDefaultTheme('default');
        }]);

    return app;
});
