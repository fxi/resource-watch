import React from 'react';
import PropTypes from 'prop-types';

// Redux
import withRedux from 'next-redux-wrapper';
import { initStore } from 'store';

// Layout
import Page from 'layout/page';
import Layout from 'layout/layout/layout-admin';
import Tabs from 'components/ui/Tabs';

// Tabs
import FaqsTab from 'components/admin/faqs/FaqsTab';

// Components
import Title from 'components/ui/Title';

// Contants
const DATA_TABS = [{
  label: 'FAQs',
  value: 'faqs',
  route: 'admin_faqs',
  params: { tab: 'faqs' }
}];

class Faqs extends Page {
  constructor(props) {
    super(props);

    const { url } = props;

    this.state = {
      tab: url.query.tab || 'faqs',
      id: url.query.id,
      subtab: url.query.subtab
    };
  }

  componentWillReceiveProps(nextProps) {
    const { url } = nextProps;

    this.setState({
      tab: url.query.tab || 'faqs',
      id: url.query.id,
      subtab: url.query.subtab
    });
  }

  render() {
    const { url, user } = this.props;
    const { tab, subtab, id } = this.state;

    return (
      <Layout
        title="FAQs"
        description="Faqs description..."
        user={user}
        url={url}
      >
        {/* PAGE HEADER */}
        <div className="c-page-header -admin">
          <div className="l-container -admin">
            <div className="page-header-content -with-tabs">
              <Title className="-primary -huge page-header-title" >
                FAQs
              </Title>
              <Tabs
                options={DATA_TABS}
                defaultSelected={tab}
                selected={tab}
              />
            </div>
          </div>
        </div>
        <div className="c-page-section">
          <div className="l-container -admin">
            {tab === 'faqs' &&
              <FaqsTab tab={tab} subtab={subtab} id={id} />
            }
          </div>
        </div>
      </Layout>
    );
  }
}

Faqs.propTypes = {
  user: PropTypes.object,
  url: PropTypes.object
};


export default withRedux(initStore, null, null)(Faqs);
