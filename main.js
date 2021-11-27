// window.onload = init;
// function init() {
    const map = new ol.Map({
        view: new ol.View({
            center: [-8236575.792110519, 4973235.140319245],
            zoom: 5,
            minZoom: 4,
            maxZoom: 18,
            extent: [-8267536.611922189, 4938222.188713483, -8200877.417120842, 4996755.287155063]
        }),
        target: 'js-map'
    })
    const theMap = document.querySelector('#js-map');
    map.on('click', getInfoBase);
    map.addControl(new ol.control.ZoomSlider());

    // let mousePosition = new ol.control.MousePosition();
    // map.addControl(mousePosition);

    let fullScreen = new ol.control.FullScreen({label:'F'});
	map.addControl(fullScreen);

    //basemaps
    const openStreetMapStandard = new ol.layer.Tile({
        source: new ol.source.OSM(),
        visible: false,
        title: "OSMStandard"
    });

    const openStreetMapHumanitarian = new ol.layer.Tile({
        source: new ol.source.OSM({
            url: "https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        }),
        visible: false,
        title: "OSMHumanitarian"
    });

    const stamenTerrain = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg",
            attributions: `Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.`
        }),
        visible: true,
        title: "StamenTerrain"
    });

    const worldTopo = new ol.layer.Tile({
        source: new ol.source.XYZ({
            attributions:
              'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
              'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
            url:
              'https://server.arcgisonline.com/ArcGIS/rest/services/' +
              'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          }),
          visible: false,
          title: 'randomArcGIS'
    });

    const usaTopo = new ol.layer.Tile({
        source: new ol.source.XYZ({
            attributions:
              'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
              'rest/services/USA_Topo_Maps/MapServer">ArcGIS</a>',
            url:
              'https://server.arcgisonline.com/arcgis/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}',
          }),
          visible: false,
          title: 'USATopo'
    });

    const baseLayerGroup = new ol.layer.Group({
        layers: [openStreetMapStandard, openStreetMapHumanitarian, stamenTerrain, worldTopo, usaTopo]
    });

    map.addLayer(baseLayerGroup);

    const baseLayerElements = document.querySelectorAll('.basemap');
    const basedLayerElements = document.querySelectorAll('.baselayer');

    const randomlayer = new ol.layer.Image({
        title: "nyc_wetlands",
        visible: false,
        source: new ol.source.ImageWMS({
            url: "http://localhost:8080/geoserver/wms",
            params: {'LAYERS': 'nyc:nyc_wetlands'},
            ratio: 1,
            serverType: 'geoserver'
        })
    });
    
    const nyclayer = new ol.layer.Image({
        title: "street_and_highway",
        source: new ol.source.ImageWMS({
            url: "http://localhost:8080/geoserver/wms",
            params: {'LAYERS': 'nyc:street_and_highway'},
            ratio: 1,
            serverType: 'geoserver'
        }),
        visible: false
    });

    const cafelayer = new ol.layer.Image({
        title: "sidewalk_cafe",
        visible: false,
        source: new ol.source.ImageWMS({
            url: "http://localhost:8080/geoserver/wms",
            params: {'LAYERS': 'nyc:sidewalk_cafe'},
            ratio: 1,
            serverType: 'geoserver'
        })
    });

    const basedLayerGroup = new ol.layer.Group({
        layers: [nyclayer, randomlayer, cafelayer]
    });

    const addedLayerGroup = new ol.layer.Group({
        layer: []
    });

    const allLayerGroup = new ol.layer.Group({
        layers: [nyclayer, randomlayer, cafelayer]
    });

    map.addLayer(basedLayerGroup);
    map.addLayer(addedLayerGroup);

    function handleSelect(whichChecked, baseElements, layerGroup, special=false) {
        baseElements.forEach((baseLayerElement) => {
            baseLayerElement.addEventListener('change', () => {
                let baseLayerElementValue = baseLayerElement.value;
                layerGroup.getLayers().forEach((element, index, array) => {
                    let baseLayerTitle = element.get('title');
                    element.setVisible(baseLayerTitle === baseLayerElementValue);
                    if(baseLayerTitle === baseLayerElementValue) {
                        whichChecked = baseLayerElementValue
                        console.log("reached here");
                    }
                })
            })
        });
    }

    let layerSwitcher = new ol.control.LayerSwitcher({
        activationMode: 'click',
        startActive: true,
        tipLabel: 'Layers', // Optional label for button
        groupSelectStyle: 'group', // Can be 'children' [default], 'group' or 'none'
        collapseTipLabel: 'Collapse layers',
      });

    map.addControl(layerSwitcher);
    
    function getInfoBase(evt) {
        document.getElementById('info').innerHTML = '';
        const viewResolution = /** @type {number} */ (map.getView().getResolution());
        let no_layers = allLayerGroup.getLayers().get('length');
        let url = new Array();
	    let wmsSource = new Array();
	    let layer_title = new Array();
        for (let i = 0; i < no_layers; i++) {
            let visibility = allLayerGroup.getLayers().item(i).getVisible();
            if(visibility == true) {
                layer_title[i] = allLayerGroup.getLayers().item(i).get('title');
                wmsSource[i] = new ol.source.ImageWMS({
                    url: 'http://localhost:8080/geoserver/wms',
                    params: {'LAYERS': layer_title[i]},
                    serverType: 'geoserver',
                    crossOrigin: 'anonymous'
                });
                url[i] = wmsSource[i].getFeatureInfoUrl(
                    evt.coordinate, viewResolution, 'EPSG:3857',
                    {'INFO_FORMAT': 'text/html'});
                if (url[i]) {
                    fetch(url[i])
                      .then((response) => response.text())
                      .then((html) => {
                        // console.log(html);
                        document.getElementById('info').innerHTML = html;
                        const hasData = document.getElementsByClassName('featureInfo');
                        if(hasData.length > 0) {
                            theMap.classList.add('space-map');
                            console.log("has something");
                        }
                        else {
                            theMap.classList.remove('space-map');
                        }
                    });
                }
            }
        }
    }

    let whichChecked = 'OSMStandard';
    handleSelect(whichChecked, baseLayerElements, baseLayerGroup);

    let whichCheckedLayers = '';
    basedLayerElements.forEach((basedLayerElement) => {
        basedLayerElement.addEventListener('change', () => {
            let basedLayerElementValue = basedLayerElement.value;
            basedLayerGroup.getLayers().forEach((element, index, array) => {
                let basedLayerTitle = element.get('title');
                element.setVisible(basedLayerTitle === basedLayerElementValue);
                if(basedLayerTitle === basedLayerElementValue) {
                    whichCheckedLayers = basedLayerElementValue;
                }
            })
        })
    });

    let currentZoom = map.getView().getZoom();
    map.on('moveend', (e) => {
        if(currentZoom != map.getView().getZoom()) {
            currentZoom = map.getView().getZoom();
            basedLayerGroup.getLayers().forEach((element, index, array) => {
                if(Math.round(map.getView().getZoom()) - 12 >= 0 && Math.round(map.getView().getZoom()) < 15) {
                    console.log(`element index: ${index} \ncurrentthing: ${Math.round(map.getView().getZoom()) - 12}`)
                    element.setVisible(index == Math.round(map.getView().getZoom()) - 12);
                } else {
                    let basedLayerTitle = element.get('title');
                    console.log("checked: " + whichCheckedLayers);
                    element.setVisible(basedLayerTitle === whichCheckedLayers);
                }
            })
            console.log(Math.round(map.getView().getZoom()))
        }
    })

    const addedlayers = ['Wetlands in NYC', 'Street and Highway Capital Reconstruction Projects', 'Sidewalk Cafe'];

    const additional = document.querySelector('#additional');
    const added = document.querySelector('#added');
    const addlayerbtn = document.querySelector('#addlayer');
    const addselectedbtn = document.querySelector('#addselected');
    const cancelbtn = document.querySelector("#cancel");

    addlayerbtn.addEventListener('click', function(e) {
        const parser = new ol.format.WMSCapabilities();
        fetch('http://localhost:8080/geoserver/wms?service=wms&version=1.1.1&request=GetCapabilities')
        .then(function (response) {
            return response.text();
        })
        .then(function (text) {
            const result = parser.read(text);
            const a = result['Capability']['Layer']['Layer']
            for(let i = 0; i < a['length']; i++) {
                if(!addedlayers.includes(a[i].Title)) {
                    let addthis = `<label for="` + a[i].Name + `">` + "\n" + `<input type="checkbox" ` + `class="newadds" id="` + a[i].Title + `" name="` + a[i].Name + `" value="` + a[i].Name + `">` + a[i].Title + "\n" + `</label><br>`;
                    additional.innerHTML += addthis;
                }
            }
            addlayerbtn.classList.add('hidden');
            addselectedbtn.classList.remove('hidden');
            cancelbtn.classList.remove('hidden');
        });
    });

    cancelbtn.addEventListener('click', (e) => {
        addlayerbtn.classList.remove('hidden');
        addselectedbtn.classList.add('hidden');
        cancelbtn.classList.add('hidden');
        while(additional.firstChild) {
            additional.removeChild(additional.firstChild);
        }
    });

    addselectedbtn.addEventListener('click', function(e) {
        const checks = document.querySelectorAll('.newadds');
        console.log(checks);
        checks.forEach((e) => {
            if(e.checked) {
                console.log(e.value);
                const newlayer = new ol.layer.Image({
                    title: e.name,
                    visible: false,
                    source: new ol.source.ImageWMS({
                        url: "http://localhost:8080/geoserver/wms",
                        params: {'LAYERS': e.value},
                        ratio: 1,
                        serverType: 'geoserver'
                    })
                });
                addedLayerGroup.getLayers().insertAt(0, newlayer);
                allLayerGroup.getLayers().insertAt(0, newlayer);
                // console.log(addedLayerGroup.getLayers());
                addedlayers.push(e.id);
                let addthis = `<input type="radio" class='addedlayer' name='addedLayerRadio' id='${e.name}' value='${e.id}'>${e.id}<br>`;
                added.innerHTML += addthis;
                if(layerschecked != "") {
                    document.getElementById(`${layerschecked}`).checked = true;
                    console.log("got here");
                }
                addlayerbtn.classList.remove('hidden');
                addselectedbtn.classList.add('hidden');
                cancelbtn.classList.add('hidden');
                while(additional.firstChild) {
                    additional.removeChild(additional.firstChild);
                }
                somefunction();
            }
        });
    });

    let layerschecked = "";
    function somefunction() {
        if(addedlayers.length != 0) {
            const addedLayerElements = document.querySelectorAll('.addedlayer');
            addedLayerElements.forEach((addedLayerElement) => {
                addedLayerElement.addEventListener('change', () => {
                    let addedLayerElementValue = addedLayerElement.id;
                    console.log(addedLayerElementValue);
                    addedLayerGroup.getLayers().forEach((element, index, array) => {
                        let addedLayerTitle = element.get('title');
                        element.setVisible(addedLayerTitle === addedLayerElementValue);
                        layerschecked = addedLayerElementValue;
                    })
                })
            });
        }
    } 
    const datalayerbtn = document.querySelector('#datalayer')
    const addfile = document.querySelector("#myFile")
    const titlelayer = document.querySelector("#titlelayer")
    const adddatalayerbtn = document.querySelector("#addpicked")

    //GEOCODER
    var popup = new ol.Overlay.Popup();

    // Instantiate with some options and add the Control
    const geocoder = new Geocoder('nominatim', {
      provider: 'osm',
      targetType: 'glass-button',
      lang: 'en',
      placeholder: 'Search for ...',
      limit: 5,
      keepOpen: false,
    });
  
    map.addControl(geocoder);
    map.addOverlay(popup);
  
    // Listen when an address is chosen
    geocoder.on('addresschosen', (evt) => {
      window.setTimeout(() => {
        popup.show(evt.coordinate, evt.address.formatted);
      }, 3000);
    });

    datalayerbtn.addEventListener('click', () => {
        datalayerbtn.classList.add('hidden')
        titlelayer.classList.remove('hidden')
        addfile.classList.remove('hidden');
        adddatalayerbtn.classList.remove('hidden');
    })


    datalayerbtn.addEventListener('click', () => {
        datalayerbtn.classList.add('hidden')
        titlelayer.classList.remove('hidden')
        addfile.classList.remove('hidden');
        adddatalayerbtn.classList.remove('hidden');
    })

    adddatalayerbtn.addEventListener('click', () => {
        const title = titlelayer.value
        let addthis = `<input type="radio" class='addedlayer' name='addedLayerRadio' id='${title}' value='${title}'>${title}<br>`;
        added.innerHTML += addthis;
        if(layerschecked != "") {
            document.getElementById(`${layerschecked}`).checked = true;
            console.log("got here");
        }
        const importedFile = addfile.files[0]
        if(importedFile.name.substr(importedFile.name.length-7) == 'geojson') {
            const reader = new FileReader();
            reader.onload = function() {
                const vector = new ol.layer.Vector({
                    title: title,
                    visible: false,
                    source: new ol.source.Vector({
                        url: reader.result,
                        format: new ol.format.GeoJSON()
                    })
                });
                addedLayerGroup.getLayers().insertAt(0, vector);
            }
            reader.readAsDataURL(importedFile);
        }
        else if(importedFile.name.substr(importedFile.name.length-3) == 'zip') {
            const reader = new FileReader();
            reader.onload = function() {
                shp(reader.result).then(function(geojson) {
                    const vector = new ol.layer.Vector({
                        title: title,
                        visible: false,
                        source: new ol.source.Vector({
                            features: new ol.format.GeoJSON().readFeatures(geojson, {featureProjection: 'EPSG:3857'})
                        })
                    });
                    addedLayerGroup.getLayers().insertAt(0, vector);
                })
            }
            reader.readAsArrayBuffer(importedFile);
        }
        else if(importedFile.name.substr(importedFile.name.length-3) == 'csv') {
            const reader = new FileReader();
            reader.onload = function() {
                console.log(reader.result);
                //TODO
                
            }
            reader.readAsText(importedFile);
        }

        const addedLayerElements = document.querySelectorAll('.addedlayer');
        addedLayerElements.forEach((addedLayerElement) => {
            addedLayerElement.addEventListener('change', () => {
                let addedLayerElementValue = addedLayerElement.value;
                addedLayerGroup.getLayers().forEach((element, index, array) => {
                    let addedLayerTitle = element.get('title');
                    element.setVisible(addedLayerTitle === addedLayerElementValue);
                    layerschecked = addedLayerElementValue;
                })
            })
        });

        datalayerbtn.classList.remove('hidden')
        titlelayer.classList.add('hidden')
        addfile.classList.add('hidden');
        adddatalayerbtn.classList.add('hidden');
        titlelayer.value = "";
        addfile.value = "";
    })

    const raster = new ol.layer.Tile({
        source: new ol.source.OSM(),
      });
      
      const source = new ol.source.Vector();
      
      const vector = new ol.layer.Vector({
        source: source,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2,
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33',
            }),
          }),
        }),
      });
      
      /**
       * Currently drawn feature.
       * @type {import("../src/ol/Feature.js").default}
       */
       let sketch;
      
       /**
        * The help tooltip element.
        * @type {HTMLElement}
        */
       let helpTooltipElement;
       
       /**
        * Overlay to show the help messages.
        * @type {Overlay}
        */
       let helpTooltip;
       
       /**
        * The measure tooltip element.
        * @type {HTMLElement}
        */
       let measureTooltipElement;
       
       /**
        * Overlay to show the measurement.
        * @type {Overlay}
        */
       let measureTooltip;
       
       /**
        * Message to show when the user is drawing a polygon.
        * @type {string}
        */
       const continuePolygonMsg = 'Click to continue drawing the polygon';
       
       /**
        * Message to show when the user is drawing a line.
        * @type {string}
        */
       const continueLineMsg = 'Click to continue drawing the line';
      
       /**
       * Handle pointer move.
       * @param {import("../src/ol/MapBrowserEvent").default} evt The event.
       */
      
       let enableDraw = false;
      const pointerMoveHandler = function (evt) {
        if(enableDraw) {
          if (evt.dragging) {
            return;
          }
          /** @type {string} */
          let helpMsg = 'Click to start drawing';
      
          if (sketch) {
            const geom = sketch.getGeometry();
            if (geom instanceof ol.geom.Polygon) {
              helpMsg = continuePolygonMsg;
            } else if (geom instanceof ol.geom.LineString) {
              helpMsg = continueLineMsg;
            }
          }
      
          helpTooltipElement.innerHTML = helpMsg;
          helpTooltip.setPosition(evt.coordinate);
      
          helpTooltipElement.classList.remove('hidden');
        }
      };
      
      map.addLayer(vector);

      map.on('pointermove', pointerMoveHandler);
      
      map.getViewport().addEventListener('mouseout', function () {
        if(enableDraw) {
          helpTooltipElement.classList.add('hidden');
        }
      });
      
      const typeSelect = document.getElementById('type');
      
      let draw; // global so we can remove it later
      
      /**
       * Format length output.
       * @param {LineString} line The line.
       * @return {string} The formatted length.
       */
      const formatLength = function (line) {
        const length = ol.sphere.getLength(line);
        let output;
        if (length > 100) {
          output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
        } else {
          output = Math.round(length * 100) / 100 + ' ' + 'm';
        }
        return output;
      };
      
      /**
       * Format area output.
       * @param {Polygon} polygon The polygon.
       * @return {string} Formatted area.
       */
       const formatArea = function (polygon) {
        const area = ol.sphere.getArea(polygon);
        let output;
        if (area > 10000) {
          output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
        } else {
          output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
        }
        return output;
      };
      
      function addInteraction() {
        const type = typeSelect.value == 'area' ? 'Polygon' : typeSelect.value == "length" ? 'LineString' : "None";
        if(type == 'None') {
          if(enableDraw == true) {
            helpTooltipElement.innerHTML = "";
            helpTooltipElement.classList.add('hidden');
            helpTooltipElement.parentNode.removeChild(helpTooltipElement);
          }
          enableDraw = false;
          map.removeInteraction(draw);
        }
        else {
          draw = new ol.interaction.Draw({
            source: source,
            type: type,
            style: new ol.style.Style({
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)',
              }),
              stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2,
              }),
              image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                  color: 'rgba(0, 0, 0, 0.7)',
                }),
                fill: new ol.style.Fill({
                  color: 'rgba(255, 255, 255, 0.2)',
                }),
              }),
            }),
          });
          map.addInteraction(draw);
      
          createMeasureTooltip();
          createHelpTooltip();
          enableDraw = true;
      
          let listener;
          draw.on('drawstart', function (evt) {
            // set sketch
            sketch = evt.feature;
      
            /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
            let tooltipCoord = evt.coordinate;
      
            listener = sketch.getGeometry().on('change', function (evt) {
              const geom = evt.target;
              let output;
              if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
              } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
              }
              measureTooltipElement.innerHTML = output;
              measureTooltip.setPosition(tooltipCoord);
            });
          });
      
          draw.on('drawend', function () {
            measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
            measureTooltip.setOffset([0, -7]);
            // unset sketch
            sketch = null;
            // unset tooltip so that a new one can be created
            measureTooltipElement = null;
            createMeasureTooltip();
            ol.Observable.unByKey(listener);
          });
        }
      }
      
      /**
       * Creates a new help tooltip
       */
       function createHelpTooltip() {
        if (helpTooltipElement && enableDraw) {
          console.log(enableDraw);
          helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'ol-tooltip hidden';
        helpTooltip = new ol.Overlay({
          element: helpTooltipElement,
          offset: [15, 0],
          positioning: 'center-left',
        });
        map.addOverlay(helpTooltip);
      }
      
      /**
       * Creates a new measure tooltip
       */
       function createMeasureTooltip() {
        if (measureTooltipElement) {
          measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
        measureTooltip = new ol.Overlay({
          element: measureTooltipElement,
          offset: [0, -15],
          positioning: 'bottom-center',
          stopEvent: false,
          insertFirst: false,
        });
        map.addOverlay(measureTooltip);
      }
      
      /**
       * Let user change the geometry type.
       */
      typeSelect.onchange = function () {
        map.removeInteraction(draw);
        addInteraction();
      };
      
      addInteraction();
// };