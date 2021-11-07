// const { ol } = require("./libs/v6.9.0-dist/ol");

// const { ol } = require("./libs/v6.9.0-dist/ol");

window.onload = init;

function init() {
    const map = new ol.Map({
        view: new ol.View({
            // extent: [four coordinates to set extent to nyc],
            // projection: 'EPSG:2263' <-figure out how to make this work
            center: [-8236575.792110519, 4973235.140319245],
            zoom: 5,
            // maxZoom: 14,
            minZoom: 4,
            extent: [-8267536.611922189, 4938222.188713483, -8200877.417120842, 4996755.287155063]
        }),
        // layers: [
        //     new ol.layer.Tile({
        //         source: new ol.source.OSM()
        //     })
        // ],
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
    // map.addLayer(stamenTerrain);
    
      
    //Layer Group
    const baseLayerGroup = new ol.layer.Group({
        layers: [openStreetMapStandard, openStreetMapHumanitarian, stamenTerrain, worldTopo, usaTopo]
    });


    map.addLayer(baseLayerGroup);

    //layer switcher logic for basemaps
    // const baseLayerElements = document.querySelectorAll('input[type=radio]');
    const baseLayerElements = document.querySelectorAll('.basemap');
    const basedLayerElements = document.querySelectorAll('.baselayer');

    const randomlayer = new ol.layer.Image({
        title: "Wetlands",
        visible: true,
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

    // nyclayer.setVisible();

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
    // const nyclayer = new ol.layer.WMS("Wetlands", 
    //     "http://localhost:8080/geoserver/wms/nyc", {layers: 'nyc:nyc_roads'});

    const basedLayerGroup = new ol.layer.Group({
        layers: [nyclayer, randomlayer, cafelayer]
    });

    console.log(basedLayerGroup.getLayers());

    const addedLayerGroup = new ol.layer.Group({
        layer: []
    });

    map.addLayer(basedLayerGroup);
    map.addLayer(addedLayerGroup);

    let whichChecked = 'OSMStandard';
    baseLayerElements.forEach((baseLayerElement) => {
        baseLayerElement.addEventListener('change', () => {
            let baseLayerElementValue = baseLayerElement.value;
            // console.log("here");
            baseLayerGroup.getLayers().forEach((element, index, array) => {
                let baseLayerTitle = element.get('title');
                element.setVisible(baseLayerTitle === baseLayerElementValue);
                if(baseLayerTitle === baseLayerElementValue) {
                    whichChecked = baseLayerElementValue;
                    console.log(whichChecked);
                }
            })
        })
    });

    let whichCheckedLayers = 'Wetlands';
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

    // map.on('moveend', (e) => {
    //     baseLayerGroup.getLayers().forEach((element, index, array) => {
    //         if(Math.round(map.getView().getZoom()) < 15) {
    //             console.log(`element index: ${index} \ncurrentthing: ${Math.round(map.getView().getZoom()) - 11}`)
    //             element.setVisible(index == Math.round(map.getView().getZoom()) - 11);
    //         } else {
    //             let baseLayerTitle = element.get('title');
    //             element.setVisible(baseLayerTitle === whichChecked);
    //             console.log(whichChecked);
    //         }
    //     })
    //     console.log(Math.round(map.getView().getZoom()))
    // })

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
    // console.log(baseLayerElements);


    // let url = 'http://localhost:8080/geoserver/rest/workspaces/nyc/featuretypes.json';

    // fetch(url)
    // .then(res => res.json())
    // .then(out =>
    // console.log('Checkout this JSON! ', out))
    // .catch(err => console.log(err));

    const addedlayers = ['Wetlands in NYC', 'Street and Highway Capital Reconstruction Projects', 'Sidewalk Cafe'];

    const additional = document.querySelector('#additional');
    const added = document.querySelector('#added');
    const addlayerbtn = document.querySelector('#addlayer');
    const addselectedbtn = document.querySelector('#addselected');

    addlayerbtn.addEventListener('click', function(e) {
        const parser = new ol.format.WMSCapabilities();

        fetch('http://localhost:8080/geoserver/wms?service=wms&version=1.1.1&request=GetCapabilities')
        .then(function (response) {
            return response.text();
        })
        .then(function (text) {
            const result = parser.read(text);
            const a = result['Capability']['Layer']['Layer']
            // console.log(result['Capability']['Layer']['Layer'])
            for(let i = 0; i < a['length']; i++) {
                if(!addedlayers.includes(a[i].Title)) {
                    let addthis = `<label for="` + a[i].Name + `">` + "\n" + `<input type="checkbox" ` + `class="newadds" id="` + a[i].Title + `" name="` + a[i].Name + `" value="` + a[i].Name + `">` + a[i].Title + "\n" + `</label><br>`;
                    additional.innerHTML += addthis;
                    console.log("Name: " + a[i].Name + "\nTitle: " + a[i].Title + "\nAbstract: " + a[i].Abstract);
                }
            }
            addlayerbtn.classList.add('hidden');
            addselectedbtn.classList.remove('hidden');
            // console.log(a['length'])
            // document.getElementById('log').innerText = JSON.stringify(result, null, 2);
        });
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
                let addthis = `<input type="radio" class='addedlayer' name='addedLayerRadio' value='${e.id}'>${e.id}<br>`;
                added.innerHTML += addthis;
                addlayerbtn.classList.remove('hidden');
                addselectedbtn.classList.add('hidden');
                while(additional.firstChild) {
                    additional.removeChild(additional.firstChild);
                }
                somefunction();
            }
        });
    });


    let lastChecked = "";
    function somefunction() {
        if(addedlayers.length != 0) {
            // console.log("heerre")
            const addedLayerElements = document.querySelectorAll('.addedlayer');
            addedLayerElements.forEach((addedLayerElement) => {
                addedLayerElement.addEventListener('change', () => {
                    let addedLayerElementValue = addedLayerElement.value;
                    // console.log(addedLayerElementValue);
                    addedLayerGroup.getLayers().forEach((element, index, array) => {
                        console.log(element.get('title'));
                        let addedLayerTitle = element.get('title');
                        element.setVisible(addedLayerTitle === addedLayerElementValue);
                    })
                })
            });
        }
    }
    
    
};
