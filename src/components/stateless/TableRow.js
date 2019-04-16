import React from "react";

export const TableRow = ({
  date,
  startKm,
  finishKm,
  distanceKm,
  startAdress,
  jobDescription,
  endAdress,
  driverName
}) => (
  <tr className="table-row-data">
    <td>{date}</td>
    <td>{startKm}</td>
    <td>{finishKm}</td>
    <td>{distanceKm}</td>
    <td>{startAdress}</td>
    <td>{jobDescription}</td>
    <td>{endAdress}</td>
    <td>{driverName}</td>
  </tr>
);
