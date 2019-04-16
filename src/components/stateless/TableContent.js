import React from "react";
import { TableHead } from "./TableHead";
import { TableRow } from "./TableRow";
import { AppContext } from "../statefull/Provider";

export const TableContent = () => (
  <table className="table">
    <TableHead />
    <TableBody />
  </table>
);

const TableBody = () => (
  <tbody>
    <AppContext.Consumer>
      {({ currentMonthData }) => {
        let dd = Object.values(currentMonthData || {}).filter(
          el => typeof el === "object"
        );

        dd.sort((a, b) => {
          return (
            Number(a[0].date.split("/")[0]) - Number(b[0].date.split("/")[0])
          );
        });

        return dd.map((route, index) => {
          if (typeof route != "object") {
            return null;
          }
          console.log(route);
          return Object.values(route).map((el, i) => (
            <TableRow
              date={el.date}
              startKm={el.startKm}
              finishKm={el.finishKm}
              distanceKm={el.distanceKm}
              startAdress={el.startAdress}
              jobDescription={el.jobDescription}
              endAdress={el.endAdress}
              driverName={el.driverName}
            />
          ));
        });
      }}
    </AppContext.Consumer>
  </tbody>
);

/* MONTH DATA FORM OF :
July : 
[
  {date , startKm, finishKm, distanceKm,startAdress,jobDescription,endAdress,driverName},
  {date , startKm, finishKm, distanceKm,startAdress,jobDescription,endAdress,driverName},
  {date , startKm, finishKm, distanceKm,startAdress,jobDescription,endAdress,driverName}
],
May : 
[
  {date , startKm, finishKm, distanceKm,startAdress,jobDescription,endAdress,driverName},
  {date , startKm, finishKm, distanceKm,startAdress,jobDescription,endAdress,driverName},
  {date , startKm, finishKm, distanceKm,startAdress,jobDescription,endAdress,driverName}
]




*/
