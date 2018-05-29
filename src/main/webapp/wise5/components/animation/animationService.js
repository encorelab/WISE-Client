'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _componentService = require('../componentService');

var _componentService2 = _interopRequireDefault(_componentService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AnimationService = function (_ComponentService) {
  _inherits(AnimationService, _ComponentService);

  function AnimationService($filter, StudentDataService, UtilService) {
    _classCallCheck(this, AnimationService);

    return _possibleConstructorReturn(this, (AnimationService.__proto__ || Object.getPrototypeOf(AnimationService)).call(this, $filter, StudentDataService, UtilService));
  }

  _createClass(AnimationService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('animation.componentTypeLabel');
    }
  }, {
    key: 'createComponent',
    value: function createComponent() {
      var component = _get(AnimationService.prototype.__proto__ || Object.getPrototypeOf(AnimationService.prototype), 'createComponent', this).call(this);
      component.type = 'Animation';
      component.widthInPixels = 600;
      component.widthInUnits = 60;
      component.heightInPixels = 200;
      component.heightInUnits = 20;
      component.dataXOriginInPixels = 0;
      component.dataYOriginInPixels = 80;
      component.coordinateSystem = 'screen';
      component.objects = [];
      return component;
    }
  }, {
    key: 'isCompleted',
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
      var result = false;

      if (componentStates && componentStates.length) {
        var submitRequired = node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;

        if (submitRequired) {
          // completion requires a submission, so check for isSubmit in any component states
          for (var i = 0, l = componentStates.length; i < l; i++) {
            var state = componentStates[i];
            if (state.isSubmit && state.studentData) {
              // component state is a submission
              if (state.studentData.response) {
                // there is a response so the component is completed
                result = true;
                break;
              }
            }
          }
        } else {
          // get the last component state
          var _l = componentStates.length - 1;
          var componentState = componentStates[_l];

          var studentData = componentState.studentData;

          if (studentData != null) {
            if (studentData.response) {
              // there is a response so the component is completed
              result = true;
            }
          }
        }
      }

      if (component.completionCriteria != null) {
        /*
         * there is a special completion criteria authored in this component
         * so we will evaluate the completion criteria to see if the student
         * has completed this component
         */
        result = this.StudentDataService.isCompletionCriteriaSatisfied(component.completionCriteria);
      }

      return result;
    }
  }, {
    key: 'getStudentDataString',
    value: function getStudentDataString(componentState) {

      var studentDataString = '';

      if (componentState != null) {
        var studentData = componentState.studentData;

        if (studentData != null) {
          // get the response the student typed
          studentDataString = studentData.response;
        }
      }

      return studentDataString;
    }
  }, {
    key: 'componentStateHasStudentWork',
    value: function componentStateHasStudentWork(componentState, componentContent) {
      if (componentState != null) {
        var studentData = componentState.studentData;
        if (studentData != null) {
          return true;
        }
      }
      return false;
    }
  }]);

  return AnimationService;
}(_componentService2.default);

AnimationService.$inject = ['$filter', 'StudentDataService', 'UtilService'];

exports.default = AnimationService;
//# sourceMappingURL=animationService.js.map
