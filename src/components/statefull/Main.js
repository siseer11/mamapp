import React from "react";
import { TableContent } from "../stateless/TableContent";
import { MonthSelect } from "../stateless/MonthSelect";
import AddModal from "./AddModal";

export default class Main extends React.Component {
  state = {
    showAddModal: false
  };

  toggleModal = () => {
    this.setState(prevState => ({
      showAddModal: !prevState.showAddModal
    }));
  };

  render() {
    const { showAddModal } = this.state;

    return (
      <div className="main-wrapper">
        <MonthSelect />
        <TableContent />
        {showAddModal && <AddModal toggleModal={this.toggleModal} />}
        <div onClick={this.toggleModal} class="add-button">
          <h2>+</h2>
        </div>
      </div>
    );
  }
}
