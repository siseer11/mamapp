import React from "react";
import { getPlacePrediction } from "../../helperFunctions/index";
import { getPlacesDistances } from "../../helperFunctions/index";
import { AppContext } from "./Provider";
import { firestore } from "../../App";
import { months } from "../../globalVariables/index";

export default class AddModal extends React.Component {
  render() {
    const { toggleModal } = this.props;
    return (
      <AppContext.Consumer>
        {context => (
          <AddModalWithProvider
            peopleDataDb={context.peopleData}
            addPeopleToState={context.addPeopleToState}
            toggleModal={toggleModal}
            premadeRoutes={context.premadeRoutes}
            updateMonthData={context.updateMonthData}
            changeLastInsertedKm={context.changeLastInsertedKm}
            lastInsertedKm={context.lastInsertedKm}
            lastDate={context.lastDate}
            premadeDate={context.premadeDate}
          />
        )}
      </AppContext.Consumer>
    );
  }
}

class AddModalWithProvider extends React.Component {
  componentDidMount() {
    console.log(this.props.lastDate);
  }

  state = {
    newRoute: true,
    date: this.props.premadeDate,
    kmStart: this.props.lastInsertedKm,
    startPlace: "Norrgårdsvägen 85, Åkersberga",
    homeGeo: [18.305184, 59.487007],
    personAdressData: [
      {
        name: "",
        adress: "",
        geoPoints: []
      }
    ],
    distances: {},
    placesPredictions: null,
    peopleDataDb: this.props.peopleDataDb
  };

  handleSubmit = e => {
    const {
      peopleDataDb,
      personAdressData,
      newRoute,
      distances,
      kmStart,
      startPlace
    } = this.state;
    const { addPeopleToState } = this.props;

    e.preventDefault();
    /*
     * Check if the person is in the db, if not add it
     */
    const peopleDataDbArray = Object.values(peopleDataDb || {});

    const inPersonInDb = lookingFor =>
      peopleDataDbArray.some(person => person.name == lookingFor.name);

    personAdressData.forEach(person => {
      if (!inPersonInDb(person)) {
        //Person is not in the db, add it
        firestore
          .collection("people")
          .add(person)
          .then(docRef => {
            //Add person to the local state ( Provider )
            addPeopleToState({
              [docRef.id]: {
                id: docRef.id,
                ...person
              }
            });

            //And to component state
            this.setState(prevState => ({
              peopleDataDb: {
                ...prevState.peopleDataDb,
                [docRef.id]: {
                  id: docRef.id,
                  ...person
                }
              }
            }));
          })
          .catch(err => console.log("error pushing new people"));
      }
    });

    /*
     * Check if the route is in the db, if not create the route
     */
    if (newRoute) {
      //Add the route to the db;
      let routeName = "Home";
      personAdressData.forEach(el => (routeName += ` -> ${el.name}`));
      routeName += " -> Home";
      const route = {
        personAdressData: personAdressData,
        distances: distances,
        routeName: routeName
      };

      firestore
        .collection("routes")
        .add(route)
        .then(s => console.log("added"))
        .catch(err => console.log(err));
    }

    /*
     * Add the day, in the month both in the app table and save it in the db
     */
    let date = new Date(this.state.date);
    date = date.getDate() + "/" + (date.getMonth() + 1);

    let partialKm = Number(kmStart);

    let arr = [];
    const homeAdress = startPlace;

    personAdressData.forEach((el, i) => {
      arr.push({
        date: date,
        startKm: partialKm,
        finishKm: Number(partialKm) + Number(distances[i]),
        distanceKm: Number(distances[i]),
        startAdress: i == 0 ? homeAdress : personAdressData[i - 1].adress,
        jobDescription: `Städservice ${el.name}`,
        endAdress: personAdressData[i].adress,
        driverName: "Adriana-Maria Cuciureanu"
      });

      partialKm += Number(distances[i]);
    });

    //add back to home

    const distanceHome = Number(distances[Object.values(distances).length - 1]);
    arr.push({
      date: date,
      startKm: partialKm,
      finishKm: Number(partialKm) + distanceHome,
      distanceKm: distanceHome,
      startAdress: personAdressData[personAdressData.length - 1].adress,
      jobDescription: `Återresa`,
      endAdress: homeAdress,
      driverName: "Adriana-Maria Cuciureanu"
    });

    //Add the data to the db
    let z = new Date(this.state.date);
    const monthName = months[z.getMonth()];

    firestore
      .collection("months")
      .doc(monthName)
      .set({ [date]: arr }, { merge: true })
      .then(z => {
        console.log("ADDED IN THE DB THE DAY");
        //add into our locale state, update the km in the state
        this.props.updateMonthData(monthName, date, arr);
        this.props.changeLastInsertedKm(partialKm);
      })
      .catch(err => console.log(err));
  };

  handleInputChange = e => {
    const datasets = e.target.dataset;
    const inputFor = datasets.for;
    const value = e.target.value;

    const x = datasets.x;
    if (x) {
      this.setState(prevState => ({
        personAdressData: [
          ...prevState.personAdressData.slice(0, x),
          {
            ...prevState.personAdressData[x],
            [inputFor]: value
          },
          ...prevState.personAdressData.slice(x + 1)
        ]
      }));
    } else {
      console.log("esle");
      this.setState({
        [inputFor]: value
      });
    }
  };

  addPersonAdressField = () => {
    this.setState(prevState => ({
      personAdressData: [
        ...prevState.personAdressData,
        {
          name: "",
          adress: ""
        }
      ]
    }));
  };
  //

  getRoutesData = () => {
    const { homeGeo, personAdressData } = this.state;
    //Open googleMaps
    const homeAdress = encodeURI("Norrgårdsvägen 85, 184 36 Åkersberga");

    personAdressData.forEach((el, i) => {
      const start =
        i === 0 ? homeAdress : encodeURI(personAdressData[i - 1].adress);
      const destination = encodeURI(el.adress);
      window.open(
        `https://www.google.com/maps/dir/${start}/${destination}`,
        "_blank"
      );
    });

    getPlacesDistances(homeGeo, personAdressData).then(data => {
      console.log(data);
      data.distances.forEach((el, idx) => {
        const distance = el[0] === 0 ? el[1] : el[0];
        this.setState(prevState => ({
          distances: {
            ...prevState.distances,
            [idx]: Math.round(distance / 1000)
          }
        }));
      });
    });
  };

  getAdressPredictions = (adress, xNumberAdress) => {
    getPlacePrediction(adress).then(data => {
      const predictions = data.features;
      this.setState({
        placesPredictions: {
          data: predictions,
          xAdress: xNumberAdress
        }
      });
    });
  };

  selectAdressPrediction = (adressName, geoPoints, xNumberAdress) => {
    console.log(this.state);
    this.setState(prevState => ({
      placesPredictions: null,
      personAdressData: [
        ...prevState.personAdressData.slice(0, xNumberAdress),
        {
          ...prevState.personAdressData[xNumberAdress],
          adress: adressName,
          geoPoints: geoPoints
        },
        ...prevState.personAdressData.slice(xNumberAdress + 1)
      ]
    }));
    setTimeout(() => console.log(this.state), 300);
  };

  changePersonDb = (data, xNumberAdress) => {
    let d = data.split(" | ");

    this.setState(prevState => ({
      personAdressData: [
        ...prevState.personAdressData.slice(0, xNumberAdress),
        {
          name: d[1],
          adress: d[0],
          geoPoints: [d[2], d[3]]
        },
        ...prevState.personAdressData.slice(xNumberAdress + 1)
      ]
    }));
  };

  changeDistance = e => {
    let value = e.target.value;
    let x = e.target.dataset.x;
    this.setState(prevState => ({
      distances: {
        ...prevState.distances,
        [x]: value
      }
    }));
  };

  backHomeDistanceChange = e => {
    const value = e.target.value;
    console.log(value);
    const nDistances = Object.values(this.state.distances).length - 1;
    console.log(nDistances);

    this.setState(prevState => ({
      distances: {
        ...prevState.distances,
        [nDistances]: value
      }
    }));
  };

  changePremadeRoutes = e => {
    const z = e.target.value;
    const zz = this.props.premadeRoutes[z];
    this.setState(prevState => ({
      ...prevState,
      ...zz,
      newRoute: z ? false : true
    }));
  };

  render() {
    const {
      date,
      kmStart,
      startPlace,
      personAdressData,
      placesPredictions,
      peopleDataDb,
      distances
    } = this.state;
    const { premadeRoutes } = this.props;
    console.log(distances);
    return (
      <div className="modal">
        <div className="add-form-wrapper">
          <div className="modal-close" onClick={this.props.toggleModal}>
            X
          </div>
          <form onSubmit={this.handleSubmit}>
            <select class="premade-route" onChange={this.changePremadeRoutes}>
              <option value="">Select one of the premade routes</option>
              {Object.values(premadeRoutes || {}).map((route, idx) => (
                <option key={route.id} value={route.id}>
                  {route.routeName}
                </option>
              ))}
            </select>
            <div className="form-row">
              <input
                onChange={this.handleInputChange}
                data-for="date"
                type="date"
                value={date}
                className="add-form-date"
              />
              <input
                onChange={this.handleInputChange}
                data-for="kmStart"
                type="text"
                value={kmStart}
                placeholder="Start (km)"
                className="add-form-start-km"
              />
            </div>
            {personAdressData.map((e, i) => (
              <PersonAdressField
                predictions={
                  placesPredictions && placesPredictions.xAdress === i
                    ? placesPredictions.data
                    : null
                }
                x={i}
                key={i}
                data={personAdressData[i]}
                textChangeHandler={this.handleInputChange}
                getPrediction={this.getAdressPredictions}
                selectAdressPrediction={this.selectAdressPrediction}
                peopleDataDb={peopleDataDb}
                changePersonDb={this.changePersonDb}
                distances={distances}
                changeDistance={this.changeDistance}
              />
            ))}
            <div>
              <p>Coming back distance : </p>
              <input
                type="text"
                value={distances[Object.values(distances).length - 1]}
                onChange={this.backHomeDistanceChange}
              />
            </div>

            <div className="add-form-buttons">
              <div
                className="add-form-button"
                onClick={this.addPersonAdressField}
              >
                Add Person
              </div>
              <div className="add-form-button" onClick={this.getRoutesData}>
                Get Data
              </div>
              <input className="add-form-button" type="submit" />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

const PersonAdressField = ({
  data,
  textChangeHandler,
  selectValues,
  x,
  getPrediction,
  predictions,
  selectAdressPrediction,
  peopleDataDb,
  changePersonDb,
  distances,
  changeDistance
}) => (
  <div className="form-row person-adress-field">
    <input
      type="text"
      data-for="name"
      data-x={x}
      value={data.name}
      placeholder="Person name"
      onChange={textChangeHandler}
      className="person-name"
    />
    <select
      onChange={e => changePersonDb(e.target.value, x)}
      className="select-a-person"
    >
      <option value="">Select one</option>
      {peopleDataDb &&
        Object.values(peopleDataDb).map((el, i) => (
          <option
            key={el.id}
            value={
              el.adress +
              " | " +
              el.name +
              " | " +
              el.geoPoints[0] +
              " | " +
              el.geoPoints[1]
            }
          >
            {el.name}
          </option>
        ))}
    </select>
    <div className="person-adress-wrapper">
      <input
        className="person-adress"
        type="text"
        data-for="adress"
        data-x={x}
        value={data.adress}
        placeholder="Person adress"
        onChange={textChangeHandler}
      />
      <div
        onClick={() => getPrediction(data.adress, x)}
        className="search-for-places"
      >
        Search
      </div>
      <input
        type="text"
        value={distances[Number(x)]}
        data-x={x}
        onChange={changeDistance}
        className="distance-input"
      />
    </div>
    {predictions && (
      <div className="predictions">
        {predictions.map((prediction, i) => (
          <div
            onClick={() =>
              selectAdressPrediction(
                prediction.place_name,
                prediction.center,
                x
              )
            }
            key={i}
            className="prediction"
          >
            {prediction.place_name}
          </div>
        ))}
      </div>
    )}
  </div>
);
