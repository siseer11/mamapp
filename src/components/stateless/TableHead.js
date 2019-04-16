import React from "react";

export const TableHead = () => (
  <thead>
    <tr>
      <th rowSpan="2">Datum</th>
      <th colSpan="2">Mätarställning</th>
      <th rowSpan="2">Reslängd km</th>
      <th rowSpan="2">Resans start, adress</th>
      <th rowSpan="2">Örende och plats/företag/kontaktperson</th>
      <th rowSpan="2">Resans slut, adress</th>
      <th rowSpan="2">Anteckningar (bilförare)</th>
    </tr>
    <tr>
      <th colSpan="1" rowSpan="1">
        Start
      </th>
      <th colSpan="1" rowSpan="1">
        Ankomst
      </th>
    </tr>
  </thead>
);
