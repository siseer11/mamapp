import React from "react";
import { months } from "../..//globalVariables/index";
import { AppContext } from "../statefull/Provider";

export const MonthSelect = () => (
  <AppContext.Consumer>
    {({ selectedMonth, changeMonth }) => (
      <select value={selectedMonth} onChange={e => changeMonth(e.target.value)}>
        {months.map(month => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
    )}
  </AppContext.Consumer>
);
