let map;
let marker;

function initMap() {
  const locationInput = document.getElementById("locationInput");
  const autocomplete = new google.maps.places.Autocomplete(locationInput);

  const defaultLocation = { lat: 40.7128, lng: -74.006 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 8,
  });
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      alert("No location data available for this place.");
      return;
    }

    if (marker) {
      marker.setMap(null);
    }

    marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
    });

    map.setCenter(place.geometry.location);
  });
}
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

map = L.map("map").setView([22.52675360093836, 75.92588544673066], 16);

var streetLayer = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

var satelliteLayer = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

function openLocationPicker() {
  const locationPickerDiv = document.getElementById("locationPicker");
  locationPickerDiv.style.display = "block";
  // map = L.map("map").setView([22.52675360093836, 75.92588544673066], 16);
  // // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  // L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
  //   maxZoom: 20,
  //   subdomains: ["mt0", "mt1", "mt2", "mt3"],
  // }).addTo(map);
  if (map.hasLayer(satelliteLayer)) {
    map.removeLayer(satelliteLayer);
    streetLayer.addTo(map);
  } else {
    streetLayer.addTo(map);
  }

  marker = L.marker([0, 0]).addTo(map);
  map.on("click", (event) => {
    const locationInput = document.getElementById("guessInput");
    locationInput.innerHTML = event.latlng.lat + ", " + event.latlng.lng;

    marker.setLatLng(event.latlng);
    locationPickerDiv.style.display = "none";
  });
}
function openLocationPicker2() {
  const locationPickerDiv = document.getElementById("locationPicker");
  locationPickerDiv.style.display = "block";
  // map = L.map("map").setView([22.52675360093836, 75.92588544673066], 16);
  // // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  // L.tileLayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
  //   maxZoom: 20,
  //   subdomains: ["mt0", "mt1", "mt2", "mt3"],
  // }).addTo(map);

  if (map.hasLayer(streetLayer)) {
    map.removeLayer(streetLayer);
    satelliteLayer.addTo(map);
  } else {
    satelliteLayer.addTo(map);
  }

  marker = L.marker([0, 0]).addTo(map);
  map.on("click", (event) => {
    const locationInput = document.getElementById("guessInput");
    locationInput.innerHTML = event.latlng.lat + ", " + event.latlng.lng;

    marker.setLatLng(event.latlng);
    locationPickerDiv.style.display = "none";
  });
}

function submitLocation(actualLat, actualLong) {
  console.log(actualLat, actualLong);
  console.log(typeof actualLat);
  const locationInput = document.getElementById("guessInput");
  coord = locationInput.innerHTML;
  console.log(coord);
  lat = parseFloat(coord.split(",")[0].trim());
  lng = parseFloat(coord.split(",")[1].trim());
  const distanceInKm = calculateDistance(actualLat, actualLong, lat, lng);
  const maxScore = 100;
  const minDistance = 0;
  const maxDistance = 0.5;
  let score = Math.max(
    maxScore -
      (distanceInKm - minDistance) *
        ((maxScore - 1) / (maxDistance - minDistance)),
    0
  );
  score = Math.round(score);
  console.log(score);
  // sendNotification();
  // alert("You scored " + score + " points.");
  if (score > 0) sendNotification("Congrats", score);
  else sendNotification("OOPS", 0);
  fetch("/update-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ score: score }),
    
  }).then((response)=>{
    window.location.reload()
  }).catch((error) => {
    console.error("Error updating score:", error);
  });

  setTimeout(function () {
    window.location.reload();
  }, 3000);
}

function sendNotification(type, points) {
  document.getElementById("type").innerHTML = type;
  document.getElementById("points").innerHTML =
    "You scored " + points + " points!";
  const toast = document.querySelector(".toast");
  (closeIcon = document.querySelector(".close")),
    (progress = document.querySelector(".progress"));

  let timer1, timer2;
  toast.classList.add("active");
  progress.classList.add("active");

  timer1 = setTimeout(() => {
    toast.classList.remove("active");
  }, 5000); //1s = 1000 milliseconds

  timer2 = setTimeout(() => {
    progress.classList.remove("active");
  }, 5300);
  closeIcon.addEventListener("click", () => {
    toast.classList.remove("active");

    setTimeout(() => {
      progress.classList.remove("active");
    }, 300);

    clearTimeout(timer1);
    clearTimeout(timer2);
  });

}
