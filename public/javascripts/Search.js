var Search = (function() {
  'use strict';

  var SEARCH_URL = 'http://ws.geonames.org/searchJSON?q={query}&maxRows=1&lang='+ navigator.language +'&username=osmbuildings';

  var _el;

  function _onKeyDown(e) {
    var value = _el.value;
    if (e.keyCode !== 13 || !value) {
      return;
    }

    _el.blur(); // for iOS in order to close the keyboard
    e.preventDefault();

    if (value.indexOf('http') === 0) {
      me.onUrlEntered(value)
      return;
    }

    xhr(SEARCH_URL, { query:value }, _onResponse);
	}

  function _onResponse(res) {
    var item = res.geonames[0];
    if (!item) {
      _el.style.backgroundColor = '#ffcccc';
    } else {
      _el.style.backgroundColor = '#ffffff';
      me.onResult(item);
    }
	}

  document.addEventListener('DOMContentLoaded', function() {
    _el = getElement('#search');
    _el.placeholder = 'Search or URL...';
    _el.addEventListener('keydown', _onKeyDown, null);
    _el.addEventListener('focus', function() {
      me.onInteraction()
    }, null);
  });

  var me = {};

  me.onResult = function() {};
  me.onInteraction = function() {};

  return me;

}());