import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'routes';

class EditAction extends React.Component {
  render() {
    return (
      <span>
        <Link
          route="myrw_detail"
          params={{ tab: 'collections', id: this.props.data.id }}
        >
          <a className="c-btn">Edit</a>
        </Link>
      </span>
    );
  }
}

EditAction.propTypes = {
  data: PropTypes.object.isRequired
};

export default EditAction;
