let gMap;
let locationsArray;
let firstModal = true;


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

    gMap = new Map(document.getElementById("myMapID"), {
      zoom: 4,
      center: {lat: 0, lng: 0},
      mapId: "DEMO_MAP_ID",
      gestureHandling: "greedy"
    });

    const modalButton = document.getElementById("modal-button-container")
    const mainModal = document.getElementById("modal")
    const startButton = document.getElementById("start")
    modalButton.addEventListener("click", () => {
        if (!firstModal) {
           startButton.innerHTML = "Continue Game" 
        }
        mainModal.style.display = "flex"
        endGameModal.style.display = "none"
    })
    startButton.addEventListener("click", () => {
        mainModal.style.display = "none";
        firstModal = false;
    })
    const helpButton = document.getElementById("finish-game");
    const endGameModal = document.getElementById("end-game-modal");
    const forfeitButton = document.getElementById("forfeit");
    const closeBox = document.getElementById("close-end-game");
    const finishedGame = document.getElementById("finished-game-modal")
    const restartButton = document.getElementById("restart-button")
    const finalScore = document.getElementById("final-score")
    helpButton.addEventListener("click", () => {
        endGameModal.style.display = "flex"
    })
    closeBox.addEventListener("click", () => {
        endGameModal.style.display = "none";
    })
    forfeitButton.addEventListener("click", () => {
        mainModal.style.display = "none"
        finishGame()
        finishedGame.style.display = "flex"
    })
    restartButton.addEventListener("click", () => {
        restartGame()
    })
    

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
        slider.value = -difference
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

    function updateScore(currentScore) {
        const score = document.getElementById("score");
        score.innerHTML = "Current Score: " + currentScore
    }

    function mapLocations(locationsArray) {
        locationsArray.forEach((location) => {
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
            marker.addListener('click', () => {
                infoWindow.open({
                    anchor: marker,
                    map: gMap
                })
            })
        });
    }

    function finishGame() {
        mapLocations(locationsArray);
    }

    function restartGame () {
        location.reload()
    }
    
    function playGame(locationsArray) {      
        let foundAllLocations = false;
        let currentLocationIndex = 0
        let locationFound = false
        let isChangingCenter = false
        let score = 0
        google.maps.event.addListener(gMap, 'center_changed', function () {
            if (isChangingCenter) {
                return
            }
            isChangingCenter = true
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
                score += 10
                updateScore(score)
                finishedGame.style.display = "flex"
                finalScore.innerHTML = "Congratulations! You finished the game with a score of: " + score
            }
            else if (locationFound && currentLocationIndex <= 9) {
                createLocationMarker(locationsArray[currentLocationIndex])
                const locationFoundModal = document.getElementById("location-found");
                locationFoundModal.style.display = "flex"
                setTimeout(() => {
                    locationFoundModal.style.display = "none";
                }, 3000)
                score += 10
                updateScore(score)
                currentLocationIndex += 1
            } else {
                score -= 5
                if (score < 0) {
                    score = 0
                }
                updateScore(score);
            }
        })
    }

    playGame(locationsArray);
  }
  
initMap();
   