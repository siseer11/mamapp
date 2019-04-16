import React from "react";
import { firestore } from "../../App";
import { getPlacePrediction } from "../../helperFunctions/index";

const mmm = [
  "January",
  "Februari",
  "Mars",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "Augusti",
  "September",
  "Oktober",
  "November",
  "December"
];

//1. Create the context
export const AppContext = React.createContext();

//2. Create a provider, the redux store
export default class AppProvider extends React.Component {
  state = {
    selectedMonth: "Mars",
    peopleData: {},
    appLoading: true,
    homeGeo: [18.305184, 59.487007],
    premadeRoutes: {},
    monthsData: {},
    lastInsertedKm: 0,
    lastDate: new Date()
  };

  changeMonth = newMonth => {
    this.setState({
      selectedMonth: newMonth
    });
  };

  changeLastInsertedKm = newKm => {
    this.setState({
      lastInsertedKm: newKm
    });
  };

  //Fetch all the data needed in the app
  componentDidMount() {
    //1. fetch all the people
    const peoplePromise = fetchAllPeople();
    //2. fetch all the routes
    const routesPromise = fetchAllRoutes();
    //3. fetch all the days
    const monthsPromise = fetchAllMonths();

    Promise.all([peoplePromise, routesPromise, monthsPromise]).then(values => {
      const [peopleData, routesData, monthsData] = values;
      this.setPeople(peopleData);
      this.setRoutes(routesData);
      this.setMonths(monthsData);
    });
  }

  //Add people to the state
  setPeople = data => {
    this.setState(prevState => ({
      peopleData: {
        ...prevState.peopleData,
        ...data
      }
    }));
  };

  //Add routes to the state
  setRoutes = data => {
    this.setState(prevState => ({
      premadeRoutes: {
        ...prevState.premadeRoutes,
        ...data
      }
    }));
  };

  //Add months data to the state
  setMonths = data => {
    this.setState(prevState => ({
      monthsData: {
        ...prevState.monthsData,
        ...data
      }
    }));
  };

  updateMonthData = (month, date, newDayData) => {
    this.setState(prevState => ({
      monthsData: {
        ...prevState.monthsData,
        [month]: {
          ...prevState.monthsData[month],
          [date]: newDayData
        }
      }
    }));
  };

  render() {
    const {
      selectedMonth,
      peopleData,
      monthsData,
      premadeRoutes,
      lastInsertedKm,
      lastDate
    } = this.state;

    let allMonthsKm = 0;
    let thisMonthKm = 0;

    const mmmz = mmm.indexOf(selectedMonth) + 1;

    const premadeDate = `2019-${mmmz}-01`;

    for (let key in monthsData) {
      let kmMonth = Object.values(monthsData[key]);
      kmMonth = kmMonth.reduce((acc, val) => {
        let thisDayKm = 0;
        if (typeof val === "object") {
          val.forEach(way => (thisDayKm += way.distanceKm));
        }
        acc += thisDayKm;
        return acc;
      }, 0);

      if (key == selectedMonth) {
        thisMonthKm += kmMonth;
      }

      allMonthsKm += kmMonth;
    }
    console.log(allMonthsKm);
    return (
      <AppContext.Provider
        value={{
          selectedMonth: selectedMonth,
          changeMonth: this.changeMonth,
          peopleData: peopleData,
          addPeopleToState: this.setPeople,
          currentMonthData: monthsData[selectedMonth],
          premadeRoutes: premadeRoutes,
          updateMonthData: this.updateMonthData,
          changeLastInsertedKm: this.changeLastInsertedKm,
          lastInsertedKm: lastInsertedKm,
          lastDate: lastDate,
          allMonthsKm: allMonthsKm,
          thisMonthKm: thisMonthKm,
          premadeDate: premadeDate
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}

function fetchAllPeople() {
  return firestore
    .collection("people")
    .get()
    .then(snap => {
      const peopleData = {};
      snap.forEach(person => {
        peopleData[person.id] = { ...person.data(), id: person.id };
      });
      return peopleData;
    })
    .catch(err => new Error(err.message));
}

function fetchAllRoutes() {
  return firestore
    .collection("routes")
    .get()
    .then(snap => {
      if (snap.empty) {
        return {};
      }
      const allRoutes = {};

      snap.forEach(route => {
        allRoutes[route.id] = { ...route.data(), id: route.id };
      });

      return allRoutes;
    });
}

function fetchAllMonths() {
  const months = {};
  return firestore
    .collection("months")
    .get()
    .then(snap => {
      if (snap.empty) {
        return {};
      }
      snap.forEach(month => {
        months[month.id] = { ...month.data(), id: month.id };
      });
      return months;
    });
}
