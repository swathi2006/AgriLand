let map;
let userMarker;
let selectedMarker;
let geocoder;

function initMap() {
  try {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 16.5062, lng: 80.6480 },
      zoom: 20,
      mapId: "a28de65e8baf8853"
    });

    geocoder = new google.maps.Geocoder();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          map.setCenter(userLocation);
          console.log(map.getCenter().toString());
          map.setZoom(14);

          userMarker = new google.maps.marker.AdvancedMarkerElement({
            position: userLocation,
            map: map,
          });
        },
        () => {
          alert("Location access denied or not available.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }

    map.addListener("click", function (e) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      document.getElementById("lat").textContent = lat.toFixed(6);
      document.getElementById("lng").textContent = lng.toFixed(6);

      setCoordinates(lat, lng);

      if (selectedMarker) {
        selectedMarker.position = e.latLng;
      } else {
        selectedMarker = new google.maps.marker.AdvancedMarkerElement({
          position: e.latLng,
          map: map,
        });
      }
    });
  } catch (err) {
    console.error("Map initialization error:", err);
    handleMapError();
  }
}

function searchAddress() {
  const address = document.getElementById("address").value;
  if (address.trim() === "") {
    alert("Please enter an address.");
    return;
  }

  geocoder.geocode({ address: address }, function (results, status) {
    if (status === "OK") {
      const location = results[0].geometry.location;
      map.setCenter(location);
      map.setZoom(18);

      if (selectedMarker) {
        selectedMarker.map = null;
      }

      selectedMarker = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: map,
        title: "Searched Location",
      });

      document.getElementById("lat").textContent = location.lat().toFixed(6);
      document.getElementById("lng").textContent = location.lng().toFixed(6);
      setCoordinates(location.lat(), location.lng());
    } else {
      alert("Address not found: " + status);
    }
  });
}

function setCoordinates(lat, lng) {
  document.getElementById("latInput").value = lat;
  document.getElementById("lngInput").value = lng;
}

function handleMapError() {
  alert("Google Maps failed to download! Using dummy coordinates.");
  document.getElementById("latInput").value = "16.094200";
  document.getElementById("lngInput").value = "80.165703";
}

document.getElementById("submit_cor").addEventListener("click", function (event) {
  const latInput = document.getElementById("latInput").value;
  const lngInput = document.getElementById("lngInput").value;

  if (!latInput || !lngInput) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          document.getElementById("latInput").value = position.coords.latitude;
          document.getElementById("lngInput").value = position.coords.longitude;
          document.querySelector("form").submit();
        },
        () => {
          alert("Unable to fetch location. Please select manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }

    event.preventDefault();
  }
});

// Make initMap globally accessible to Google Maps callback
window.initMap = initMap;
