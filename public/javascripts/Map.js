var Map = (function() {
  'use strict';

  var DEFAULT_LAT = 45.06759,
    DEFAULT_LON = 7.65445,
    DEFAULT_ZOOM = 15,
    MAX_ZOOM = 18;

  var _engine;

  function _restoreState() {
    var state = State.load();

    state.lat = state.lat !== undefined ? parseFloat(state.lat) : DEFAULT_LAT;
    state.lon = state.lon !== undefined ? parseFloat(state.lon) : DEFAULT_LON;
    state.zoom = state.zoom ? Math.max(Math.min(parseInt(state.zoom, 10), MAX_ZOOM), 0) : DEFAULT_ZOOM;

    me.setState(state);
  }

  function _initLeaflet() {
    var engine = new L.Map('map', { zoomControl:false });

    new L.TileLayer('http://{s}.tiles.mapbox.com/v3/osmbuildings.map-c8zdox7m/{z}/{x}/{y}.png', {
      attribution:'Map tiles &copy; <a href="http://mapbox.com">MapBox</a>',

      maxZoom:MAX_ZOOM
    }).addTo(engine);

    me.saveState = function() {
      var center = engine.getCenter();
      State.save({
        lat:center.lat.toFixed(5),
        lon:center.lng.toFixed(5),
        zoom:engine.getZoom()
      });
    };

    me.setState = function(state) {
      engine.setView([state.lat, state.lon], state.zoom, false);
    };

    engine.on('moveend zoomend', function() {
      me.saveState()
    }, me);

    engine.on('click movestart',function() {
      me.onInteraction()
    }, me);

    return engine;
  }

  function _initOpenLayers() {
    var engine = new OpenLayers.Map('map', {
      controls: [
        new OpenLayers.Control.Navigation(),
      // new OpenLayers.Control.PanZoomBar(),
      // new OpenLayers.Control.MousePosition(),
      //  new OpenLayers.Control.LayerSwitcher(),
        new OpenLayers.Control.Attribution()
      ]
    });

    engine.addControl(new OpenLayers.Control.LayerSwitcher());
    engine.addLayer(new OpenLayers.Layer.OSM());

    me.saveState = function() {
      var center = engine.getCenter().transform(
        engine.getProjectionObject(),
        new OpenLayers.Projection('EPSG:4326')
      );

      State.save({
        lat:center.lat.toFixed(5),
        lon:center.lon.toFixed(5),
        zoom:engine.getZoom() //,
  //    url:customUrl
      });
    };

    me.setState = function(state) {
      engine.setCenter(
        new OpenLayers.LonLat(state.lon, state.lat).transform(
          new OpenLayers.Projection('EPSG:4326'),
          engine.getProjectionObject()
        ), state.zoom
      );
    };

    engine.events.register('moveend', me, function() {
      me.saveState()
    });

    engine.events.register('zoomend', me, function() {
      me.saveState()
    });

    engine.events.register('click', me, function() {
      me.onInteraction()
    });

    engine.events.register('movestart', me, function() {
      me.onInteraction()
    });

    me.setState({ lat:DEFAULT_LAT, lon:DEFAULT_LON, zoom:DEFAULT_ZOOM })

    return engine;
  }

  var me = {};

  me.init = function(options) {
    switch (options.type) {
      case 'Leaflet':    _engine = _initLeaflet();    break;
      case 'OpenLayers': _engine = _initOpenLayers(); break;
    }

    window.map = _engine;
    window.osmb = new OSMBuildings(_engine);

    if (options.loadData) {
      window.osmb.loadData();
    }

    _restoreState();
  };

  me.saveState = function() {};
  me.setState = function() {};
  me.onInteraction = function() {};

  return me;

}());
