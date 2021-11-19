// window.onload = init;
// function init() {
    const map = new ol.Map({
        view: new ol.View({
            center: [-8236575.792110519, 4973235.140319245],
            zoom: 5,
            minZoom: 4,
            extent: [-8267536.611922189, 4938222.188713483, -8200877.417120842, 4996755.287155063]
        }),
        target: 'js-map'
    })
    map.on('click', (e) => console.log(e.coordinate));

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
        title: "Wetlands",
        visible: false,
        source: new ol.source.ImageWMS({
            url: "http://localhost:8080/geoserver/wms",
            params: {'LAYERS': 'nyc:nyc_wetlands'},
            ratio: 1,
            serverType: 'geoserver'
        })
    });
    
    const nyclayer = new ol.layer.Image({
        title: "Streets and Highways Reconstruction",
        source: new ol.source.ImageWMS({
            url: "http://localhost:8080/geoserver/wms",
            params: {'LAYERS': 'nyc:street_and_highway'},
            ratio: 1,
            serverType: 'geoserver'
        }),
        visible: false
    });

    const cafelayer = new ol.layer.Image({
        title: "Sidewalk Cafe Regulations",
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

    let whichChecked = 'OSMStandard';
    handleSelect(whichChecked, baseLayerElements, baseLayerGroup);

    let whichCheckedLayers = '';
    handleSelect(whichCheckedLayers, basedLayerElements, basedLayerGroup);

    let currentZoom = map.getView().getZoom();
    map.on('moveend', (e) => {
        if(currentZoom != map.getView().getZoom()) {
            currentZoom = map.getView().getZoom();
            basedLayerGroup.getLayers().forEach((element, index, array) => {
                if(Math.round(map.getView().getZoom()) - 12 >= 0 && Math.round(map.getView().getZoom()) < 15) {
                    console.log(`element index: ${index} \ncurrentthing: ${Math.round(map.getView().getZoom()) - 12}`)
                    element.setVisible(index == Math.round(map.getView().getZoom()) - 12);
                    console.log(element.get('title'));
                } else {
                    let basedLayerTitle = element.get('title');
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
        checks.forEach((e) => {
            if(e.checked) {
                console.log(e.value);
                const newlayer = new ol.layer.Image({
                    title: e.id,
                    visible: false,
                    source: new ol.source.ImageWMS({
                        url: "http://localhost:8080/geoserver/wms",
                        params: {'LAYERS': e.value},
                        ratio: 1,
                        serverType: 'geoserver'
                    })
                });
                addedLayerGroup.getLayers().insertAt(0, newlayer);
                console.log(addedLayerGroup.getLayers());
                addedlayers.push(e.id);
                let addthis = `<input type="radio" class='addedlayer' name='addedLayerRadio' id='${e.id}' value='${e.id}'>${e.id}<br>`;
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
                    let addedLayerElementValue = addedLayerElement.value;
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
      provider: 'photon',
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
// };