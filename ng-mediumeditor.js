var angular = require('angular');
var MediumEditor = require('medium-editor');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/default.css');

function directive() {
  function toInnerText(value) {
    var tempEl = document.createElement('div'), text;
    tempEl.innerHTML = value;
    text = tempEl.textContent || '';
    return text.trim();
  }
  
  return {
    require: '?ngModel',
    restrict: 'AE',
    replace: true,
    scope: {
      ngModel: '=',
      bindOptions: '='
    },
    template: '<div class="editable"></div>',
    link: function(scope, element, attrs, ngModel) {
      var defaultContentSrc = attrs['defaultContentSrc'];
      
      var editor = new MediumEditor(element, {
        placeholder: false,
        toolbar: {
          allowMultiParagraphSelection: true,
          buttons: ['bold', 'italic', 'underline', 'anchor', 'h1', 'h2', 'h3', 'quote'],
          diffLeft: 0,
          diffTop: -10,
          firstButtonClass: 'medium-editor-button-first',
          lastButtonClass: 'medium-editor-button-last',
          relativeContainer: null,
          standardizeSelectionStart: false,
          static: false,
          align: 'center',
          sticky: false,
          updateOnEmptySelection: false
        },
        anchor: {
          customClassOption: null,
          customClassOptionText: 'Button',
          linkValidation: true,
          placeholderText: '링크를 입력하세요',
          targetCheckbox: true,
          targetCheckboxText: '새창으로 열기'
        },
        paste: {
          forcePlainText: true,
          cleanPastedHTML: false,
          cleanReplacements: [],
          cleanAttrs: ['class', 'style', 'dir'],
          cleanTags: ['meta'],
          unwrapTags: []
        }
      });
      
      ngModel.$render = function() {
        var chtml = element.html();
        var html = ngModel.$viewValue;
        
        if( chtml != html ) 
          element.html(ngModel.$viewValue || '');
        
        var placeholder = editor.getExtensionByName('placeholder');
        if (placeholder)
          placeholder.updatePlaceholder(element[0]);
      };
      
      ngModel.$isEmpty = function(value) {
        if (/[<>]/.test(value)) {
          return toInnerText(value).length === 0;
        } else if (value) {
          return value.length === 0;
        } else {
          return true;
        }
      };
      
      editor.subscribe('editableInput', function(event, editable) {
        var html = editable.innerHTML.trim();
        ngModel.$setViewValue(html);
        attrs.ngChange && scope.$parent.$eval(attrs.ngChange, {$html: html});
      });
      
      scope.$watch('options', function(bindOptions) {
        editor.init(element, bindOptions);
      });
      
      scope.$on('$destroy', function() {
        editor.destroy();
      });
    }
  };
}

angular.module('ngMediumEditor', []).directive('mediumEditor', directive);
module.exports = directive;
