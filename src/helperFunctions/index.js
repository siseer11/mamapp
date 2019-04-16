import * as firebase from "firebase";
const myToken = "";
export const firebaseInit = () => {
  const config = {};

  return firebase.initializeApp(config);
};

export const constructPlaceSearchUrl = place => {
  const adress = encodeURI(place);

  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${adress}.json?`;
  url += `country=se&routing=false&types=address`;
  url += `&access_token=${myToken}`;

  return url;
};

export const getPlacePrediction = place => {
  return fetch(constructPlaceSearchUrl(place))
    .then(data => data.json())
    .catch(err => console.log(err));
};

export const getPlacesDistances = (homeGeo, places) => {
  let placesString = homeGeo.join(",");

  places.forEach(place => (placesString += ";" + place.geoPoints.join(",")));

  let sources = "0";
  let destinations = "1";

  if (places.length > 1) {
    for (let index = 0; index < places.length - 1; index++) {
      sources += `;${index + 1}`;
      destinations += `;${index + 2}`;
    }
  }

  //Add the home again for the comeback home
  placesString += ";" + homeGeo.join(",");
  sources += ";" + places.length;
  destinations += ";" + (places.length + 1);

  return fetch(
    `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${placesString}?sources=${sources}&destinations=${destinations}&annotations=distance&access_token=${myToken}`
  ).then(data => data.json());
};
