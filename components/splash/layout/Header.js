import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'routes';

// Modal
import Modal from 'components/modal/modal-component';
import CreditsModal from 'components/modal/credits-modal';

class Header extends React.Component {
  static defaultProps = {
    showEarthViewLink: false
  };

  static propTypes = {
    showEarthViewLink: PropTypes.bool,
    showCreditsModal: PropTypes.bool,
    skipAnimation: PropTypes.func.isRequired,
    hideSkip: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      showCreditsModal: false
    };
  }

  handleToggleCreditsModal = (bool) => {
    this.setState({ showCreditsModal: bool });
  }

  render() {
    const { skipAnimation, hideSkip, showEarthViewLink, showCredits } = this.props;

    return (
      <div className="c-splash-header">
        <Link route="home">
          <img className="logo" src="/static/images/logo-resource-watch.png" alt="Resource Watch" />
        </Link>
        <div className="links">
          {showEarthViewLink &&
            <a
              className="earth-view-link"
              href="/splash"
            >
              <div className="earth-view-link-container">
                <img src="/static/images/splash/globe.svg" alt="Earth view" />
                <span className="link-text">Earth View</span>
              </div>
            </a>
          }
          {showCredits &&
            <a
              role="button"
              tabIndex={0}
              onKeyDown={() => this.handleToggleCreditsModal(true)}
              onClick={() => this.handleToggleCreditsModal(true)}
            >
              Credits
              <Modal
                isOpen={this.state.showCreditsModal}
                onRequestClose={() => this.handleToggleCreditsModal(false)}
              >
                <CreditsModal onRequestClose={this.handleToggleCreditsModal} />
              </Modal>
            </a>
          }
          {!hideSkip && <button onClick={skipAnimation} className="c-splash-header-skip-intro">SKIP INTRO</button>}
          <Link route="home">
            <a>Go to Resource Watch</a>
          </Link>
        </div>
      </div>
    );
  }
}

export default Header;
