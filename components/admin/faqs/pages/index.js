import React from 'react';
import PropTypes from 'prop-types';

// Components
import FaqsSortableList from 'components/admin/faqs/components/FaqsSortableList';

export default function FaqsIndex({ user = {} }) {
  return (
    <div className="c-faqs-index">
      <FaqsSortableList
        application={[process.env.APPLICATIONS]}
        authorization={user.token}
      />
    </div>
  );
}

FaqsIndex.propTypes = {
  user: PropTypes.object.isRequired
};
