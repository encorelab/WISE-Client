'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectAssetService = function () {
    function ProjectAssetService($q, $http, $rootScope, ConfigService, ProjectService, Upload, UtilService) {
        _classCallCheck(this, ProjectAssetService);

        this.$q = $q;
        this.$http = $http;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.Upload = Upload;
        this.UtilService = UtilService;
        this.projectAssets = {};
        this.projectAssetTotalSizeMax = this.ConfigService.getConfigParam('projectAssetTotalSizeMax');
        this.projectAssetUsagePercentage = 0;
    }

    _createClass(ProjectAssetService, [{
        key: 'deleteAssetItem',
        value: function deleteAssetItem(assetItem) {
            var _this = this;

            var params = {
                assetFileName: assetItem.fileName
            };

            var httpParams = {
                method: 'POST',
                url: this.ConfigService.getConfigParam('projectAssetURL'),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: $.param(params)
            };

            return this.$http(httpParams).then(function (result) {
                var projectAssetsJSON = result.data;
                _this.projectAssets = projectAssetsJSON;
                return projectAssetsJSON;
            });
        }
    }, {
        key: 'downloadAssetItem',
        value: function downloadAssetItem(assetItem) {
            var assetFileName = assetItem.fileName;

            // ask the browser to download this asset by setting the location
            window.location = this.ConfigService.getConfigParam('projectAssetURL') + "/download?assetFileName=" + assetFileName;
        }
    }, {
        key: 'getFullAssetItemURL',
        value: function getFullAssetItemURL(assetItem) {
            return this.ConfigService.getConfigParam('projectBaseURL') + "assets/" + assetItem.fileName;
        }
    }, {
        key: 'retrieveProjectAssets',
        value: function retrieveProjectAssets() {
            var _this2 = this;

            var projectAssetURL = this.ConfigService.getConfigParam('projectAssetURL');

            return this.$http.get(projectAssetURL).then(function (result) {
                var projectAssetsJSON = result.data;
                _this2.projectAssets = projectAssetsJSON;
                _this2.calculateAssetUsage();
                return projectAssetsJSON;
            });
        }
    }, {
        key: 'uploadAssets',
        value: function uploadAssets(files) {
            var _this3 = this;

            var projectAssetURL = this.ConfigService.getConfigParam('projectAssetURL');

            var promises = files.map(function (file) {
                return _this3.Upload.upload({
                    url: projectAssetURL,
                    fields: {},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (result, status, headers, config) {
                    // Only set the projectAssets if the result is an object.
                    // Sometimes it's an error message string.
                    if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object') {
                        // upload was successful.
                        _this3.projectAssets = result;
                        var uploadedFilename = config.file.name;
                        return uploadedFilename;
                    } else if (typeof result === 'string') {
                        // This is an error and should be displayed to the user.
                        alert(result);
                    }

                    return result;
                });
            });
            return this.$q.all(promises);
        }

        /**
         * Calculate which assets are used or not used
         */

    }, {
        key: 'calculateAssetUsage',
        value: function calculateAssetUsage() {

            /*
             * a list of all the project assets. each element in the list is an
             * object that contains the file name and file size
             */
            var assets = this.projectAssets;

            // get the project content as a string
            var projectJSONString = angular.toJson(this.ProjectService.project);

            // an array to hold the text files that the project uses
            var allTextFiles = [];

            if (assets != null && assets.files != null) {

                /*
                 * loop through all the asset files to find the text files that
                 * are actually used in the project
                 */
                for (var a = 0; a < assets.files.length; a++) {
                    var asset = assets.files[a];

                    if (asset != null) {
                        var fileName = asset.fileName;

                        // check if the file is a text file
                        if (this.UtilService.endsWith(fileName, ".html") || this.UtilService.endsWith(fileName, ".htm") || this.UtilService.endsWith(fileName, ".js")) {

                            // the file is a text file
                            allTextFiles.push(fileName);
                        }
                    }
                }
            }

            var usedTextFiles = [];

            /*
             * Retrieve all the text files that are used in the project. If there
             * are no text files that are used in the project, the then() will
             * still be called.
             */
            this.getTextFiles(allTextFiles).then(function (textFiles) {

                /*
                 * this variable will hold all the text content that is used in
                 * the project so we can look for asset references to determine
                 * which assets are used
                 */
                var allUsedTextContent = projectJSONString;

                /*
                 * used to keep track of all the text file names that are used in
                 * the project
                 */
                var usedTextFileNames = [];

                /*
                 * boolean flag that will help us determine if we need to loop
                 * all the text files again
                 */
                var foundNewUsedTextFile = true;

                /*
                 * Gather all the content for all the text files that are used.
                 * We will keep looping until we no longer find anymore new text
                 * files that are used.
                 * Say for example whale.html is used in a component in the project.
                 * whaly.html references whale.js
                 * In this case the first iteration of the while loop will find
                 * whale.html is used. Then in the second iteration of the while
                 * loop, it will find that whale.js is used.
                 */
                while (foundNewUsedTextFile) {

                    /*
                     * reset this to false so that we can tell if a new text file
                     * is found to be used in this current iteration of the while
                     * loop
                     */
                    foundNewUsedTextFile = false;

                    // loop through all the text files
                    for (var h = 0; h < textFiles.length; h++) {

                        // get a texzt file object
                        var textFile = textFiles[h];

                        if (textFile != null) {

                            /*
                             * get the url to the text file
                             * e.g. /wise/curriculum/26/assets/whale.html
                             */
                            var url = textFile.config.url;

                            // get the file name
                            var fileName = '';

                            // get the last index of '/'
                            var lastIndexOfSlash = url.lastIndexOf('/');

                            if (lastIndexOfSlash == -1) {
                                // the url does not contain a '/'
                                fileName = url;
                            } else {
                                /*
                                 * the url does contain a '/' so we will get everything
                                 * after it
                                 */
                                fileName = url.substring(lastIndexOfSlash + 1);
                            }

                            /*
                             * check if we have already found that this text file
                             * is used
                             */
                            if (usedTextFileNames.indexOf(fileName) == -1) {
                                /*
                                 * this is a file name that isn't yet in the array
                                 * of file names that are used
                                 */

                                if (allUsedTextContent.indexOf(fileName) != -1) {
                                    // the file name is referenced in the content

                                    // add the file name to our array of used text file names
                                    usedTextFileNames.push(fileName);

                                    // get the file content
                                    var data = textFile.data;

                                    /*
                                     * add the content of the file to our variable that
                                     * contains all the used text content
                                     */
                                    allUsedTextContent += data;

                                    /*
                                     * set the boolean flag so that we will iterate
                                     * the while loop again
                                     */
                                    foundNewUsedTextFile = true;
                                }
                            }
                        }
                    }
                }

                if (assets != null && assets.files != null) {

                    // loop through all the assets
                    for (var a = 0; a < assets.files.length; a++) {
                        var asset = assets.files[a];

                        if (asset != null) {
                            var fileName = asset.fileName;

                            if (allUsedTextContent.indexOf(fileName) != -1) {
                                // the file is used in the project
                                asset.used = true;
                            } else {
                                // the file is not used in the project
                                asset.used = false;
                            }
                        }
                    }
                }
            });
        }

        /**
         * Retrieve text files using a promise all
         * @param textFileNames a list of text file names
         * @return a promise that will retrieve all the text files
         */

    }, {
        key: 'getTextFiles',
        value: function getTextFiles(textFileNames) {

            var promises = [];

            // get the project assets path e.g. /wise/curriculum/3/assets
            var projectAssetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();

            // loop through all the text file names
            for (var t = 0; t < textFileNames.length; t++) {

                // get an text file name
                var textFileName = textFileNames[t];

                // create a promise that will return the contents of the text file
                var promise = this.$http.get(projectAssetsDirectoryPath + '/' + textFileName);

                // add the promise to our list of promises
                promises.push(promise);
            }

            return this.$q.all(promises);
        }
    }]);

    return ProjectAssetService;
}();

ProjectAssetService.$inject = ['$q', '$http', '$rootScope', 'ConfigService', 'ProjectService', 'Upload', 'UtilService'];

exports.default = ProjectAssetService;
//# sourceMappingURL=projectAssetService.js.map