let gMap;
let locationsArray;


async function initMap() {
    try{
        const response = await fetch('https://map-mania-json.azurewebsites.net/api/favorite-places');
        const result  = await response.json();
        locationsArray = result;
    } catch(err) {
        console.log(err);
    }

    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    gMap = new Map(document.getElementById("myMapID"), {
      zoom: 4,
      center: {lat: 41.5250, lng: -88.0817},
      mapId: "DEMO_MAP_ID",
      gestureHandling: "greedy"
    });
    

    function distanceDifference(map, locationsArray, currentLocationIndex) {
        const centerLat = map.getCenter().lat();
        const centerLng = map.getCenter().lng();
        const latDiff = centerLat - locationsArray[currentLocationIndex].location.lat
        const lngDiff = centerLng - locationsArray[currentLocationIndex].location.lng
        console.log(centerLat)
        console.log(centerLng)
        console.log(latDiff)
        console.log(lngDiff)
        const differenceTotal = Math.abs(latDiff) + Math.abs(lngDiff)
        console.log(differenceTotal)
        return differenceTotal
    }

    function moveSlider(difference) {
        const slider = document.getElementById("myRange");
        slider.value = difference
    }


    function isMarkerChoiceValid(marker, locationLat, locationLng) {
        let valid = false; 
        const locationLatMaxNorthernDifference = locationLat + 1
        const locationLatMaxSoutherDifference = locationLat - 1
        const locationLngMaxEasternDifference = locationLng + 1
        const locationLngMaxWesternDifference = locationLng - 1
        

        if (marker.getPosition().lat() > locationLatMaxNorthernDifference || marker.getPosition().lat() < locationLatMaxSoutherDifference
            || marker.getPosition().lng() > locationLngMaxEasternDifference || marker.getPosition().lng() < locationLngMaxWesternDifference) {
                valid = false
            } else {
                valid = true
            }
        return valid
    }
 
    function createLocationMarker(location) {
        const marker = new google.maps.Marker({
            position: {lat:location.location.lat, lng:location.location.lng},
            map: gMap,
            title: location.title,
            icon: location.iconImage,
            content: location.content
        })
        const infoWindow = new google.maps.InfoWindow({
            content: marker.content
        });
        infoWindow.open({
            anchor: marker,
            map: gMap
        })
        marker.addListener('click', () => {
            infoWindow.open({
                anchor: marker,
                map: gMap
            })
        })
    }
  
    function mapLocations(locationsArray) {      
        let foundAllLocations = false;
        let currentLocationIndex = 0
        let locationFound = false
        let isChangingCenter = false;
        google.maps.event.addListener(gMap, 'center_changed', function () {
            if (isChangingCenter) {
                return
            }
            isChangingCenter = true
            updateGame();
            const mapCenter = gMap.getCenter();
            let newLng = mapCenter.lng();
            if (newLng > 180) {
              newLng -= 360;
              gMap.setCenter(new google.maps.LatLng(mapCenter.lat(), newLng))
            } else if (newLng < -180) {
              newLng += 360;
              gMap.setCenter(new google.maps.LatLng(mapCenter.lat(), newLng))
            }
            const distance = distanceDifference(gMap, locationsArray, currentLocationIndex);
            moveSlider(distance);
            isChangingCenter = false
        });
        google.maps.event.addListener(gMap, "click", (e) => {
            const marker = new google.maps.Marker({
                position: e.latLng,
                map: gMap
            })
            setTimeout(() => {
                marker.setMap(null);
            }, 3000);
            console.log(locationsArray[currentLocationIndex].location.lat, locationsArray[currentLocationIndex].location.lng)
            locationFound = isMarkerChoiceValid(marker, locationsArray[currentLocationIndex].location.lat, locationsArray[currentLocationIndex].location.lng)
            if (currentLocationIndex >= 9) {
                createLocationMarker(locationsArray[currentLocationIndex])
                foundAllLocations = true
                console.log("Congrats you finished the Game!")
                return foundAllLocations
            }
            else if (locationFound && currentLocationIndex <= 9) {
                createLocationMarker(locationsArray[currentLocationIndex])
                console.log(currentLocationIndex)
                currentLocationIndex += 1
            } else {
                console.log("keep trying")
            }
        })
    }






        
        // const marker = new google.maps.Marker({
        //     position: {lat:location.location.lat, lng:location.location.lng},
        //     map: gMap,
        //     title: location.title,
        //     icon: location.iconImage,
        //     content: location.content
        // })
        // const infoWindow = new google.maps.InfoWindow({
        //     content: marker.content
        // });
        // marker.addListener('click', () => {
        //     infoWindow.open({
        //         anchor: marker,
        //         map: gMap
        //     })
        // })

  
    // google.maps.event.addListener(gMap, 'center_changed', function () {
    //     updateGame();
    //     distanceDifference(gMap, locationsArray);
    // });

    function updateGame() {
        //console.log('Function updateGame()');
        const zoomLevel = gMap.getZoom();
        var inBounds = false;

        if(gMap.getBounds().contains({lat: 41.5250, lng:-88.0817})) {
            inBounds = true;
        }
        console.log("inbounds:" + inBounds + " zoomLevel: "+zoomLevel);
    }
    mapLocations(locationsArray);
    // addMarker();
  }
  
initMap();
   