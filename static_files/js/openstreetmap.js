let map, infoWindow;
var marker;
var otherMarkers = [];
let yourLat;
let yourLong;
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 38.818, lng: -77.167 },
    zoom: 15,
    streetViewControl: false,
  });
  infoWindow = new google.maps.InfoWindow();

  var input = document.getElementById('searchTextField');
  let autocomplete = new google.maps.places.Autocomplete(input)
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    addMarker(place.geometry.location, map);
    map.setCenter(place.geometry.location);
  });
        
  const locationButton = document.createElement("button");

  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER ].push(locationButton);
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      new google.maps.Marker({
          position: pos,
          map: map,
          icon: '/img/maplogo.png'
      });
      yourLat = pos.lat;
      yourLong = pos.lng;
      map.setCenter(pos);
    },
    () => {
      handleLocationError(true, infoWindow, map.getCenter());
    }
  );
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
  google.maps.event.addListener(map, "click", (event) => {
    //const lat = marker.lat()
    addMarker(event.latLng, map);
    //window.alert(lat);
    //window.alert(long);
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

async function update(lat, long) {
  let temp = ""
  await fetch('https://parkit.sites.tjhsst.edu/request?lat=' + lat + '&long=' + long)
    .then(response => response.json())
    .then(data => temp = data);
  return temp
}

async function getAddress(lat, long) {
  let temp = ""
  await fetch('https://parkit.sites.tjhsst.edu/process_address?lat=' + lat + '&long=' + long)
    .then(response => response.json())
    .then(data => temp = data);
  return temp
}

let addresses = new Set()
async function addMarker(location, map) {
  for (let i = 0; i < otherMarkers.length; i++) {
    otherMarkers[i].setMap(null);
  }
  addPlacedMarker(location,map);
  var lat = location.lat();
  var lng = location.lng();
  let data = await update(lat, lng);
  console.log(data);
  let lats = data.lat;
  let longs = data.long;
  for (let i = 0; i < lats.length; i++) {

    let latitude = lats[i]
    let longitude = longs[i]

    const pos = {
      lat: latitude,
      lng: longitude,
    };
    // let output = await getAddress(lat, lng);
    // if (output.address !== undefined && output.address !== null)
    // {
    //     let tag = document.getElementById('address')
    //     tag.innerHTML = tag.innerHTML + output.address + "\n"
    //     console.log(output.address)
    // }

    addMarkerTo(pos, map)
  }
  for (let i = 0; i < lats.length; i++) {
    let output = await getAddress(lat, lng);
    if (output.address !== undefined && output.address !== null) {
      addresses.add(output.address)
      console.log(output.address)
    }
  }
  console.log(addresses)
}

function addMarkerTo(location, map) {
  var h = new google.maps.Marker({
    position: location,
    map: map,
  });
  h.setMap(map);
  otherMarkers.push(h);
  google.maps.event.addListener(h, 'click', function() {
    let a= document.createElement('a');
    a.target= '_blank';
    a.href= 'https://www.google.com/maps/dir/' + yourLat + ',' + yourLong + '/' + location.lat + ',' + location.lng + '/';
    a.click();
})}

function addPlacedMarker(location,map){
  if (marker) {
    marker.setPosition(location);
  } else {
    marker = new google.maps.Marker({
      position: location,
      map: map,
      label:"M",
    });
  }
    
}



window.initMap = initMap;