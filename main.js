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
        visible: true,
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
        visible: false,
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
    const baseLayerElements = document.querySelectorAll('input[type=radio]');

    // for(let i of baseLayerElements) {
    //     console.log(i)
    // }
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

    map.on('moveend', (e) => {
        baseLayerGroup.getLayers().forEach((element, index, array) => {
            if(Math.round(map.getView().getZoom()) < 15) {
                console.log(`element index: ${index} \ncurrentthing: ${Math.round(map.getView().getZoom()) - 11}`)
                element.setVisible(index == Math.round(map.getView().getZoom()) - 11);
            } else {
                let baseLayerTitle = element.get('title');
                element.setVisible(baseLayerTitle === whichChecked);
                console.log(whichChecked);
            }
        })
        console.log(Math.round(map.getView().getZoom()))
    })
    // console.log(baseLayerElements);
};